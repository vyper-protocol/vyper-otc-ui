/* eslint-disable camelcase */
/* eslint-disable no-console */
import { AnchorProvider, IdlAccounts, Program } from '@project-serum/anchor';
import { getMint, getMultipleAccounts, unpackAccount, unpackMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { fetchTokenInfoCached } from 'api/next-api/fetchTokenInfo';
import { CONTRACTS_TABLE_NAME, supabase } from 'api/supabase/client';
import { syncContractFromChain as syncContractDynamicData } from 'api/supabase/syncContractData';
import { RatePyth, IDL as RatePythIDL } from 'idls/rate_pyth';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { RedeemLogicDigital, IDL as RedeemLogicDigitalIDL } from 'idls/redeem_logic_digital';
import { RedeemLogicForward, IDL as RedeemLogicForwardIDL } from 'idls/redeem_logic_forward';
import { RedeemLogicSettledForward, IDL as RedeemLogicSettledForwardIDL } from 'idls/redeem_logic_settled_forward';
import { RedeemLogicVanillaOption, IDL as RedeemLogicVanillaOptionIDL } from 'idls/redeem_logic_vanilla_option';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import _ from 'lodash';
import { DbOtcState } from 'models/DbOtcState';
import { AbsRateState } from 'models/plugins/rate/AbsRateState';
import { RateAccount } from 'models/plugins/rate/RateAccount';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { AbsPayoffState } from 'models/plugins/redeemLogic/AbsPayoffState';
import { Digital } from 'models/plugins/redeemLogic/digital/Digital';
import { Forward } from 'models/plugins/redeemLogic/forward/Forward';
import { PayoffAccount } from 'models/plugins/redeemLogic/PayoffAccount';
import { SettledForward } from 'models/plugins/redeemLogic/settledForward/SettledForward';
import { VanillaOption } from 'models/plugins/redeemLogic/vanillaOption/VanillaOption';
import { getMultipleAccountsInfo } from 'utils/multipleAccountHelper';

import PROGRAMS from '../../configs/programs.json';
import { ChainOtcState } from '../../models/ChainOtcState';

export const fetchContract = async (
	connection: Connection,
	otcStateAddress: PublicKey,
	skipDbCheck: boolean = false,
	syncDynamicDataOnFetch: boolean = true
): Promise<ChainOtcState> => {
	console.group('CONTROLLER: fetchContract');
	const controllerStartMark = performance.mark('controller_start');

	let chainOtcResult: ChainOtcState = undefined;
	try {
		let dbOtcStateResult: DbOtcState = undefined;
		if (!skipDbCheck) {
			try {
				// fetching data from supabase
				const res = await supabase.from(CONTRACTS_TABLE_NAME).select().eq('pubkey', otcStateAddress.toBase58()).range(0, 1);
				if (res.error) throw Error(res.error.message);
				if (res.data.length !== 1) throw Error('entry not found');

				dbOtcStateResult = DbOtcState.createFromDBData(res.data[0]);
			} catch {}
		}

		if (!dbOtcStateResult) {
			// no data stored on database
			if (!skipDbCheck) console.warn('no data stored on database, fetching everything from chain');
			chainOtcResult = await fetchContractWithNoDbInfo(connection, otcStateAddress);
		} else {
			chainOtcResult = await fetchChainOtcStateFromDbInfo(connection, dbOtcStateResult);
		}

		if (syncDynamicDataOnFetch && chainOtcResult) {
			syncContractDynamicData(chainOtcResult);
		}
	} finally {
		console.groupEnd();
		console.log('controller total time elapsed: ', performance.measure('controller_end', controllerStartMark.name));
	}

	return chainOtcResult;
};

async function fetchContractWithNoDbInfo(connection: Connection, otcStateAddress: PublicKey): Promise<ChainOtcState> {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);

	const res = new ChainOtcState();
	res.publickey = otcStateAddress;

	res.vyperCoreTrancheConfig = accountInfo.vyperTrancheConfig;
	res.collateralMint = trancheConfigAccountInfo.reserveMint;
	res.collateralMintInfo = await getMint(connection, trancheConfigAccountInfo.reserveMint, 'confirmed');
	res.collateralTokenInfo = await fetchTokenInfoCached(trancheConfigAccountInfo.reserveMint);
	res.programBuyerTA = accountInfo.otcSeniorReserveTokenAccount;
	res.programSellerTA = accountInfo.otcJuniorReserveTokenAccount;

	res.createdAt = accountInfo.created.toNumber() * 1000;
	res.depositAvailableFrom = accountInfo.depositStart.toNumber() * 1000;
	res.depositExpirationAt = accountInfo.depositEnd.toNumber() * 1000;
	res.settleAvailableFromAt = accountInfo.settleStart.toNumber() * 1000;
	res.settleExecuted = accountInfo.settleExecuted;

	if (res.settleExecuted) {
		// @ts-ignore
		res.pricesAtSettlement = trancheConfigAccountInfo.trancheData.reserveFairValue.value.map((c) => new RustDecimalWrapper(new Uint8Array(c)).toNumber());
	}

	res.buyerDepositAmount = accountInfo.seniorDepositAmount.toNumber() / 10 ** res.collateralMintInfo.decimals;
	res.sellerDepositAmount = accountInfo.juniorDepositAmount.toNumber() / 10 ** res.collateralMintInfo.decimals;

	// get accounts
	const tokenAccountsToFetch = [
		accountInfo.otcSeniorReserveTokenAccount,
		accountInfo.otcJuniorReserveTokenAccount,
		trancheConfigAccountInfo.rateProgramState,
		trancheConfigAccountInfo.redeemLogicProgramState
	];
	if (accountInfo.seniorSideBeneficiary) tokenAccountsToFetch.push(accountInfo.seniorSideBeneficiary);
	if (accountInfo.juniorSideBeneficiary) tokenAccountsToFetch.push(accountInfo.juniorSideBeneficiary);

	const multipleAccountInfos = await getMultipleAccountsInfo(connection, tokenAccountsToFetch, 'confirmed');

	const programBuyerAccountInfo = multipleAccountInfos.find((c) => c.pubkey.equals(accountInfo.otcSeniorReserveTokenAccount));
	res.programBuyerTAAmount = Number(unpackAccount(programBuyerAccountInfo.pubkey, programBuyerAccountInfo.data).amount) / 10 ** res.collateralMintInfo.decimals;

	const programSellerAccountInfo = multipleAccountInfos.find((c) => c.pubkey.equals(accountInfo.otcJuniorReserveTokenAccount));
	res.programSellerTAAmount =
		Number(unpackAccount(programSellerAccountInfo.pubkey, programSellerAccountInfo.data).amount) / 10 ** res.collateralMintInfo.decimals;

	res.buyerTA = accountInfo.seniorSideBeneficiary;
	if (res.buyerTA) {
		const taInfo = multipleAccountInfos.find((c) => c.pubkey.equals(accountInfo.seniorSideBeneficiary));
		res.buyerWallet = unpackAccount(taInfo.pubkey, taInfo.data).owner;
	}

	res.sellerTA = accountInfo.juniorSideBeneficiary;
	if (res.sellerTA) {
		const taInfo = multipleAccountInfos.find((c) => c.pubkey.equals(accountInfo.juniorSideBeneficiary));
		res.sellerWallet = unpackAccount(taInfo.pubkey, taInfo.data).owner;
	}

	/** * * * * * * * * * * * * * * * * * * * * * * *
	 * RATE PLUGIN
	 *
	 */

	let rateProgramState: AbsRateState = undefined;
	if (trancheConfigAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// SWITCHBOARD
		try {
			const rateSwitchboardProgram = new Program<RateSwitchboard>(
				RateSwitchboardIDL,
				new PublicKey(trancheConfigAccountInfo.rateProgram),
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.rateProgramState));
			const rateStateAccountInfo = rateSwitchboardProgram.coder.accounts.decode<IdlAccounts<RateSwitchboard>['rateState']>('rateState', c.data.data);

			// @ts-ignore
			rateProgramState = new RateSwitchboardState(rateStateAccountInfo.switchboardAggregators.filter((a) => a));
			await (rateProgramState as RateSwitchboardState).loadData(connection);
		} catch (err) {
			console.error(err);
		}
	} else if (trancheConfigAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_PYTH_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// PYTH
		try {
			const ratePythProgram = new Program<RatePyth>(
				RatePythIDL,
				new PublicKey(trancheConfigAccountInfo.rateProgram),
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.rateProgramState));
			const rateStateAccountInfo = ratePythProgram.coder.accounts.decode<IdlAccounts<RatePyth>['rateState']>('rateState', c.data.data);

			// @ts-ignore
			rateProgramState = new RatePythState(rateStateAccountInfo.pythOracles.filter((a) => a));
			await (rateProgramState as RatePythState).loadData(connection);
		} catch (err) {
			console.error(err);
		}
	} else {
		throw Error('rate plugin not supported: ' + trancheConfigAccountInfo.rateProgram);
	}

	res.rateAccount = new RateAccount(trancheConfigAccountInfo.rateProgram, trancheConfigAccountInfo.rateProgramState, rateProgramState);

	/** * * * * * * * * * * * * * * * * * * * * * * *
	 * REDEEM LOGIC PLUGIN
	 *
	 * In this cases we're fetching data from the chain, we have no concept of RL plugin subtypes, we'll use the default type
	 *
	 */

	let redeemLogicProgramState: AbsPayoffState = undefined;

	if (trancheConfigAccountInfo.redeemLogicProgram.equals(new PublicKey(PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// FORWARD

		try {
			const redeemLogicForwardProgram = new Program<RedeemLogicForward>(
				RedeemLogicForwardIDL,
				trancheConfigAccountInfo.redeemLogicProgram,
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.redeemLogicProgramState));

			const redeemLogicAccountInfo = redeemLogicForwardProgram.coder.accounts.decode<IdlAccounts<RedeemLogicForward>['redeemLogicConfig']>(
				'redeemLogicConfig',
				c.data.data
			);

			const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
			const isLinear = redeemLogicAccountInfo.isLinear;
			const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.collateralMintInfo.decimals;

			redeemLogicProgramState = new Forward(strike, isLinear, notional);
		} catch (err) {
			console.error(err);
		}
	} else if (trancheConfigAccountInfo.redeemLogicProgram.equals(new PublicKey(PROGRAMS.REDEEM_LOGIC_SETTLED_FORWARD_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// FORWARD SETTLED

		try {
			const redeemLogicSettledForwardProgram = new Program<RedeemLogicSettledForward>(
				RedeemLogicSettledForwardIDL,
				trancheConfigAccountInfo.redeemLogicProgram,
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.redeemLogicProgramState));

			const redeemLogicAccountInfo = redeemLogicSettledForwardProgram.coder.accounts.decode<IdlAccounts<RedeemLogicSettledForward>['redeemLogicConfig']>(
				'redeemLogicConfig',
				c.data.data
			);

			const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
			const isLinear = redeemLogicAccountInfo.isLinear;
			const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.collateralMintInfo.decimals;
			const isStandard = redeemLogicAccountInfo.isStandard;

			redeemLogicProgramState = new SettledForward(strike, isLinear, notional, isStandard);
		} catch (err) {
			console.error(err);
		}
	} else if (trancheConfigAccountInfo.redeemLogicProgram.equals(new PublicKey(PROGRAMS.REDEEM_LOGIC_DIGITAL_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// DIGITAL

		try {
			const redeemLogicDigitalProgram = new Program<RedeemLogicDigital>(
				RedeemLogicDigitalIDL,
				trancheConfigAccountInfo.redeemLogicProgram,
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.redeemLogicProgramState));

			const redeemLogicAccountInfo = redeemLogicDigitalProgram.coder.accounts.decode<IdlAccounts<RedeemLogicDigital>['redeemLogicConfig']>(
				'redeemLogicConfig',
				c.data.data
			);

			const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
			const isCall = redeemLogicAccountInfo.isCall;

			redeemLogicProgramState = new Digital(strike, isCall);
		} catch (err) {
			console.error(err);
		}
	} else if (trancheConfigAccountInfo.redeemLogicProgram.equals(new PublicKey(PROGRAMS.REDEEM_LOGIC_VANILLA_OPTION_PROGRAM_ID))) {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// VANILLA OPTION

		try {
			const redeemLogicVanillaOptionProgram = new Program<RedeemLogicVanillaOption>(
				RedeemLogicVanillaOptionIDL,
				trancheConfigAccountInfo.redeemLogicProgram,
				new AnchorProvider(connection, undefined, {})
			);

			const c = multipleAccountInfos.find((k) => k.pubkey.equals(trancheConfigAccountInfo.redeemLogicProgramState));

			const redeemLogicAccountInfo = redeemLogicVanillaOptionProgram.coder.accounts.decode<IdlAccounts<RedeemLogicVanillaOption>['redeemLogicConfig']>(
				'redeemLogicConfig',
				c.data.data
			);

			const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
			const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.collateralMintInfo.decimals;
			const isCall = redeemLogicAccountInfo.isCall;
			const isLinear = redeemLogicAccountInfo.isLinear;

			redeemLogicProgramState = new VanillaOption(strike, notional, isCall, isLinear);
		} catch (err) {
			console.error(err);
		}
	} else {
		throw Error('redeem logic plugin not supported: ' + trancheConfigAccountInfo.redeemLogicProgram);
	}

	res.redeemLogicAccount = new PayoffAccount(
		trancheConfigAccountInfo.redeemLogicProgram,
		trancheConfigAccountInfo.redeemLogicProgramState,
		redeemLogicProgramState
	);

	return res;
}

async function fetchChainOtcStateFromDbInfo(connection: Connection, data: DbOtcState): Promise<ChainOtcState> {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	const res = new ChainOtcState();
	res.publickey = data.publickey;
	res.vyperCoreTrancheConfig = data.vyperCoreTrancheConfig;
	res.collateralMint = data.collateralMint;
	res.createdAt = data.createdAt;
	res.depositAvailableFrom = data.depositAvailableFrom;
	res.depositExpirationAt = data.depositExpirationAt;
	res.settleAvailableFromAt = data.settleAvailableFromAt;
	res.buyerDepositAmount = data.buyerDepositAmount;
	res.sellerDepositAmount = data.sellerDepositAmount;

	res.redeemLogicAccount = data.redeemLogicAccount.clone();
	res.rateAccount = data.rateAccount.clone();
	res.collateralTokenInfo = await fetchTokenInfoCached(res.collateralMint);

	// first fetch

	const firstFetch_pubkeys: PublicKey[] = [];
	firstFetch_pubkeys.push(data.publickey);
	firstFetch_pubkeys.push(data.vyperCoreTrancheConfig);
	firstFetch_pubkeys.push(data.collateralMint);
	firstFetch_pubkeys.push(...data.rateAccount.state.accountsRequiredForRefresh);

	const firstFetch_accountsData = await getMultipleAccountsInfo(connection, firstFetch_pubkeys);

	const currentOtcStateAccount = vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>(
		'otcState',
		firstFetch_accountsData.find((c) => c.pubkey.equals(data.publickey)).data.data
	);
	res.programBuyerTA = currentOtcStateAccount.otcSeniorReserveTokenAccount;
	res.programSellerTA = currentOtcStateAccount.otcJuniorReserveTokenAccount;

	res.collateralMintInfo = unpackMint(res.collateralMint, firstFetch_accountsData.find((c) => c.pubkey.equals(res.collateralMint)).data);
	res.settleExecuted = currentOtcStateAccount.settleExecuted;

	if (res.settleExecuted) {
		const currentTrancheConfigStateAccount = vyperCoreProgram.coder.accounts.decode<IdlAccounts<VyperCore>['trancheConfig']>(
			'trancheConfig',
			firstFetch_accountsData.find((c) => c.pubkey.equals(res.vyperCoreTrancheConfig)).data.data
		);

		// @ts-ignore
		res.pricesAtSettlement = currentTrancheConfigStateAccount.trancheData.reserveFairValue.value.map((c) =>
			new RustDecimalWrapper(new Uint8Array(c)).toNumber()
		);
	}

	// second fetch

	const secondFetch_TAPubkeys = [];
	secondFetch_TAPubkeys.push(currentOtcStateAccount.otcSeniorReserveTokenAccount);
	secondFetch_TAPubkeys.push(currentOtcStateAccount.otcJuniorReserveTokenAccount);
	secondFetch_TAPubkeys.push(currentOtcStateAccount.seniorSideBeneficiary);
	secondFetch_TAPubkeys.push(currentOtcStateAccount.juniorSideBeneficiary);

	const secondFetch_unionPubkeys = _.uniq(secondFetch_TAPubkeys.filter((c) => c !== null)) as PublicKey[];

	const secondFetch_accountsData = await getMultipleAccounts(connection, secondFetch_unionPubkeys);

	res.programBuyerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);
	res.programSellerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcJuniorReserveTokenAccount)).amount);

	res.buyerTA = currentOtcStateAccount.seniorSideBeneficiary;
	if (res.buyerTA) res.buyerWallet = secondFetch_accountsData.find((c) => c.address.equals(res.buyerTA)).owner;
	res.sellerTA = currentOtcStateAccount.juniorSideBeneficiary;
	if (res.sellerTA) res.sellerWallet = secondFetch_accountsData.find((c) => c.address.equals(res.sellerTA)).owner;

	// * * * * * * * * * * * * * * * * * * * * * * *
	// RATE PLUGIN
	// * * * * * * * * * * * * * * * * * * * * * * *

	if (res.rateAccount.state.rateId === 'switchboard') {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// SWITCHBOARD

		await (res.rateAccount.state as RateSwitchboardState).loadData(connection);
	} else if (res.rateAccount.state.rateId === 'pyth') {
		// * * * * * * * * * * * * * * * * * * * * * * *
		// PYTH

		await (res.rateAccount.state as RatePythState).loadData(connection);
	} else {
		throw Error('rate plugin not supported: ' + res.rateAccount.state.rateId);
	}

	// TODO missing redeem logic subtype support

	return res;
}

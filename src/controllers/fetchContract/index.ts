/* eslint-disable camelcase */
/* eslint-disable no-console */
import { AnchorProvider, IdlAccounts, Program } from '@project-serum/anchor';
import { getAccount, getMint, getMultipleAccounts, unpackMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/switchboard-v2';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { CONTRACTS_TABLE_NAME, supabase } from 'api/supabase/client';
import { loadSwitchboardProgramOffline } from 'api/switchboard/switchboardHelper';
import { fetchTokenInfo } from 'api/tokens/fetchTokenInfo';
import { RatePyth, IDL as RatePythIDL } from 'idls/rate_pyth';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { RedeemLogicForward, IDL as RedeemLogicForwardIDL } from 'idls/redeem_logic_forward';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import _ from 'lodash';
import { DbOtcState } from 'models/DbOtcState';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import RateSwitchboardState from 'models/plugins/rate/RateSwitchboardState';
import { RedeemLogicForwardState } from 'models/plugins/RedeemLogicForwardState';
import { getMultipleAccountsInfo } from 'utils/multipleAccountHelper';

import PROGRAMS from '../../configs/programs.json';
import { ChainOtcState } from '../../models/ChainOtcState';

const [DUMMY_TOKEN_MINT, USDC_MINT] = ['7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'];

export const fetchContract = async (connection: Connection, otcStateAddress: PublicKey, skipDbCheck: boolean = false): Promise<ChainOtcState> => {
	console.group('CONTROLLER: fetchContract');
	const controllerStartMark = performance.mark('controller_start');

	let dbOtcStateResult: DbOtcState = undefined;
	if (!skipDbCheck) {
		try {
			// fetching data from supabase
			const res = await supabase.from(CONTRACTS_TABLE_NAME).select().eq('pubkey', otcStateAddress.toBase58()).range(0, 1);
			if (res.error) throw Error(res.error.message);
			if (res.data.length !== 1) throw Error('entry not found');

			dbOtcStateResult = DbOtcState.fromSupabaseSelectRes(res.data[0]);
		} catch {}
	}

	let chainOtcResult: ChainOtcState = undefined;
	if (!dbOtcStateResult) {
		// no data stored on database
		console.warn('no data stored on database, fetching everything from chain');
		chainOtcResult = await fetchContractWithNoDbInfo(connection, otcStateAddress);
	} else {
		chainOtcResult = await fetchChainOtcStateFromDbInfo(connection, dbOtcStateResult);
	}

	console.groupEnd();
	console.log('controller total time elapsed: ', performance.measure('controller_end', controllerStartMark.name));
	return chainOtcResult;
};

async function fetchContractWithNoDbInfo(connection: Connection, otcStateAddress: PublicKey): Promise<ChainOtcState> {
	const promises: Promise<void>[] = [];

	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);

	const res = new ChainOtcState();
	res.publickey = otcStateAddress;

	res.vyperCoreTrancheConfig = accountInfo.vyperTrancheConfig;
	res.reserveMint = trancheConfigAccountInfo.reserveMint;
	res.reserveMintInfo = await getMint(connection, trancheConfigAccountInfo.reserveMint);

	if (trancheConfigAccountInfo.reserveMint.toBase58() === DUMMY_TOKEN_MINT) {
		res.reserveTokenInfo = await fetchTokenInfo(connection, new PublicKey(USDC_MINT));
	} else {
		res.reserveTokenInfo = await fetchTokenInfo(connection, trancheConfigAccountInfo.reserveMint);
	}

	res.createdAt = accountInfo.created.toNumber() * 1000;
	res.depositAvailableFrom = accountInfo.depositStart.toNumber() * 1000;
	res.depositExpirationAt = accountInfo.depositEnd.toNumber() * 1000;
	res.settleAvailableFromAt = accountInfo.settleStart.toNumber() * 1000;
	res.settleExecuted = accountInfo.settleExecuted;

	if (res.settleExecuted) {
		// @ts-ignore
		res.priceAtSettlement = new RustDecimalWrapper(new Uint8Array(trancheConfigAccountInfo.trancheData.reserveFairValue.value[0])).toNumber();
	}

	res.buyerDepositAmount = accountInfo.seniorDepositAmount.toNumber() / 10 ** res.reserveMintInfo.decimals;
	res.sellerDepositAmount = accountInfo.juniorDepositAmount.toNumber() / 10 ** res.reserveMintInfo.decimals;

	promises.push(
		getAccount(connection, accountInfo.otcSeniorReserveTokenAccount).then((c) => {
			res.programBuyerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);
	promises.push(
		getAccount(connection, accountInfo.otcJuniorReserveTokenAccount).then((c) => {
			res.programSellerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);

	res.buyerTA = accountInfo.seniorSideBeneficiary;
	if (res.buyerTA) {
		promises.push(
			getAccount(connection, accountInfo.seniorSideBeneficiary).then((c) => {
				res.buyerWallet = c.owner;
			})
		);
	}

	res.sellerTA = accountInfo.juniorSideBeneficiary;
	if (res.sellerTA) {
		promises.push(
			getAccount(connection, accountInfo.juniorSideBeneficiary).then((c) => {
				res.sellerWallet = c.owner;
			})
		);
	}

	// Rate plugin
	if (trancheConfigAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID))) {
		promises.push(
			new Promise(async (resolve) => {
				try {
					const rateSwitchboardProgram = new Program<RateSwitchboard>(
						RateSwitchboardIDL,
						new PublicKey(trancheConfigAccountInfo.rateProgram),
						new AnchorProvider(connection, undefined, {})
					);
					const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(trancheConfigAccountInfo.rateProgramState);
					const rateState = new RateSwitchboardState(
						trancheConfigAccountInfo.rateProgram,
						trancheConfigAccountInfo.rateProgramState,
						rateStateAccountInfo.switchboardAggregators[0]
					);
					await rateState.loadData(connection);
					res.rateState = rateState;
				} catch (err) {
					console.error(err);
				} finally {
					resolve();
				}
			})
		);
	}
	if (trancheConfigAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_PYTH_PROGRAM_ID))) {
		promises.push(
			new Promise(async (resolve) => {
				try {
					const rateSwitchboardProgram = new Program<RatePyth>(
						RatePythIDL,
						new PublicKey(trancheConfigAccountInfo.rateProgram),
						new AnchorProvider(connection, undefined, {})
					);
					const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(trancheConfigAccountInfo.rateProgramState);
					const rateState = new RatePythState(
						trancheConfigAccountInfo.rateProgram,
						trancheConfigAccountInfo.rateProgramState,
						rateStateAccountInfo.pythOracles[0]
					);
					await rateState.loadData(connection);
					res.rateState = rateState;
				} catch (err) {
					console.error(err);
				} finally {
					resolve();
				}
			})
		);
	}

	// Redeem logic plugin
	promises.push(
		new Promise(async (resolve) => {
			try {
				const redeemLogicForwardProgram = new Program<RedeemLogicForward>(
					RedeemLogicForwardIDL,
					PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID,
					new AnchorProvider(connection, undefined, {})
				);
				const redeemLogicAccountInfo = await redeemLogicForwardProgram.account.redeemLogicConfig.fetch(trancheConfigAccountInfo.redeemLogicProgramState);

				const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
				const isLinear = redeemLogicAccountInfo.isLinear;
				const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.reserveMintInfo.decimals;
				const redeemLogicState = new RedeemLogicForwardState(
					trancheConfigAccountInfo.redeemLogicProgram,
					trancheConfigAccountInfo.redeemLogicProgramState,
					strike,
					isLinear,
					notional
				);
				res.redeemLogicState = redeemLogicState;
			} catch (err) {
				console.error(err);
			} finally {
				resolve();
			}
		})
	);

	await Promise.all(promises);

	return res;
}

async function fetchChainOtcStateFromDbInfo(connection: Connection, data: DbOtcState): Promise<ChainOtcState> {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	const res = new ChainOtcState();
	res.publickey = data.publickey;
	res.vyperCoreTrancheConfig = data.vyperCoreTrancheConfig;
	res.reserveMint = data.reserveMint;
	res.createdAt = data.createdAt;
	res.depositAvailableFrom = data.depositAvailableFrom;
	res.depositExpirationAt = data.depositExpirationAt;
	res.settleAvailableFromAt = data.settleAvailableFromAt;
	res.buyerDepositAmount = data.buyerDepositAmount;
	res.sellerDepositAmount = data.sellerDepositAmount;

	res.redeemLogicState = data.redeemLogicState.clone();
	res.rateState = data.rateState.clone();

	if (res.reserveMint.toBase58() === DUMMY_TOKEN_MINT) {
		res.reserveTokenInfo = await fetchTokenInfo(connection, new PublicKey(USDC_MINT));
	} else {
		res.reserveTokenInfo = await fetchTokenInfo(connection, res.reserveMint);
	}

	// first fetch

	const firstFetch_pubkeys: PublicKey[] = [];
	firstFetch_pubkeys.push(data.publickey);
	firstFetch_pubkeys.push(data.vyperCoreTrancheConfig);
	firstFetch_pubkeys.push(data.reserveMint);
	firstFetch_pubkeys.push(...data.rateState.getPublicKeysForRefresh());

	const firstAccountsFetch_startMark = performance.mark('firstAccountsFetch_startMark');
	const firstFetch_accountsData = await getMultipleAccountsInfo(connection, firstFetch_pubkeys);
	console.log('firstAccountsFetch elapsed: ', performance.measure('firstAccountsFetch_end', firstAccountsFetch_startMark.name));

	const currentOtcStateAccount = vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>(
		'otcState',
		firstFetch_accountsData.find((c) => c.pubkey.equals(data.publickey)).data.data
	);

	res.reserveMintInfo = unpackMint(res.reserveMint, firstFetch_accountsData.find((c) => c.pubkey.equals(res.reserveMint)).data);
	res.settleExecuted = currentOtcStateAccount.settleExecuted;
	if (res.settleExecuted) {
		const currentTrancheConfigStateAccount = vyperCoreProgram.coder.accounts.decode<IdlAccounts<VyperCore>['trancheConfig']>(
			'trancheConfig',
			firstFetch_accountsData.find((c) => c.pubkey.equals(res.vyperCoreTrancheConfig)).data.data
		);

		// @ts-ignore
		res.priceAtSettlement = new RustDecimalWrapper(new Uint8Array(currentTrancheConfigStateAccount.trancheData.reserveFairValue.value[0])).toNumber();
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
	res.programSellerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);

	res.buyerTA = currentOtcStateAccount.seniorSideBeneficiary;
	if (res.buyerTA) res.buyerWallet = secondFetch_accountsData.find((c) => c.address.equals(res.buyerTA)).owner;
	res.sellerTA = currentOtcStateAccount.juniorSideBeneficiary;
	if (res.sellerTA) res.sellerWallet = secondFetch_accountsData.find((c) => c.address.equals(res.sellerTA)).owner;

	// switchboard
	if (res.rateState.getTypeId() === 'switchboard') {
		// const switchboardProgram = await loadSwitchboardProgram('devnet', connection);
		const switchboardProgram = loadSwitchboardProgramOffline('devnet', connection);

		(res.rateState as RateSwitchboardState).aggregatorData = AggregatorAccount.decode(
			switchboardProgram,
			firstFetch_accountsData.find((c) => c.pubkey.equals((res.rateState as RateSwitchboardState).switchboardAggregator)).data
		);
		const aggregatorLastValue_startMark = performance.mark('aggregatorLastValue_startMark');
		(res.rateState as RateSwitchboardState).aggregatorLastValue = (
			await new AggregatorAccount({ program: switchboardProgram, publicKey: (res.rateState as RateSwitchboardState).switchboardAggregator }).getLatestValue(
				(res.rateState as RateSwitchboardState).aggregatorData
			)
		).toNumber();
		console.log('aggregatorLastValue elapsed: ', performance.measure('aggregatorLastValue_end', aggregatorLastValue_startMark.name));
	}

	// pyth
	if (res.rateState.getTypeId() === 'pyth') {
		await res.rateState.loadData(connection);
	}

	return res;
}

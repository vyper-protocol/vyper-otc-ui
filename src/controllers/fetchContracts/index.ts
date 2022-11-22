/* eslint-disable camelcase */
/* eslint-disable no-console */
import { AnchorProvider, IdlAccounts, Program } from '@project-serum/anchor';
import { unpackAccount, unpackMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { selectContracts as supabaseSelectContracts } from 'api/supabase/selectContracts';
import { loadSwitchboardProgramOffline } from 'api/switchboard/switchboardHelper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { getMultipleAccountsInfo } from 'utils/multipleAccountHelper';

import PROGRAMS from '../../configs/programs.json';
import { FetchContractsParams } from './FetchContractsParams';

const fetchContracts = async (connection: Connection, params: FetchContractsParams): Promise<ChainOtcState[]> => {
	console.group('CONTROLLER: fetch contracts');

	const dbEntries = await supabaseSelectContracts(params);

	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	// first fetch: otcState account, vyper core tranche account, reserveMint accounts

	const firstFetch_otcStateChainAccountPubkeys = dbEntries.map((c) => c.publickey);
	const firstFetch_vyperCoreTrancheConfig = dbEntries.map((c) => c.vyperCoreTrancheConfig);
	const firstFetch_reserveMintAccountPubkeys = dbEntries.map((c) => c.reserveMint);
	const firstFetch_rateAccounts = _.flatten(dbEntries.map((c) => c.rateAccount.state.accountsRequiredForRefresh));

	const firstFetch_unionPubkeys = _.uniq([
		...firstFetch_otcStateChainAccountPubkeys,
		...firstFetch_vyperCoreTrancheConfig,
		...firstFetch_reserveMintAccountPubkeys,
		...firstFetch_rateAccounts
	]) as PublicKey[];
	const firstFetch_accountsData = await getMultipleAccountsInfo(connection, firstFetch_unionPubkeys);

	const firstFetch_otcStateAccountInfos = firstFetch_accountsData
		.filter((c) => firstFetch_otcStateChainAccountPubkeys.map((f) => f.toBase58()).includes(c.pubkey.toBase58()))
		.map((c) => vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>('otcState', c.data.data));

	// second fetch: otcSeniorReserveTokenAccount, otcJuniorReserveTokenAccount, seniorSideBeneficiary, juniorSideBeneficiary

	const secondFetch_TAPubkeys = [];
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.otcSeniorReserveTokenAccount));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.otcJuniorReserveTokenAccount));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.seniorSideBeneficiary));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.juniorSideBeneficiary));

	const secondFetch_unionPubkeys = _.uniq(secondFetch_TAPubkeys.filter((c) => c !== null)) as PublicKey[];
	const secondFetch_accountsData = (await getMultipleAccountsInfo(connection, secondFetch_unionPubkeys)).map((c) => unpackAccount(c.pubkey, c.data));

	const res: ChainOtcState[] = [];
	for (let i = 0; i < dbEntries.length; i++) {
		// const r = dbEntries[i] as AbsOtcState as ChainOtcState;
		const r = new ChainOtcState();
		r.publickey = dbEntries[i].publickey;
		r.vyperCoreTrancheConfig = dbEntries[i].vyperCoreTrancheConfig;
		r.reserveMint = dbEntries[i].reserveMint;
		r.createdAt = dbEntries[i].createdAt;
		r.depositAvailableFrom = dbEntries[i].depositAvailableFrom;
		r.depositExpirationAt = dbEntries[i].depositExpirationAt;
		r.settleAvailableFromAt = dbEntries[i].settleAvailableFromAt;
		r.buyerDepositAmount = dbEntries[i].buyerDepositAmount;
		r.sellerDepositAmount = dbEntries[i].sellerDepositAmount;

		r.rateAccount = dbEntries[i].rateAccount.clone();
		r.redeemLogicAccount = dbEntries[i].redeemLogicAccount.clone();

		const currentOtcStateAccount = vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>(
			'otcState',
			firstFetch_accountsData.find((c) => c.pubkey.equals(r.publickey)).data.data
		);

		r.reserveMintInfo = unpackMint(r.reserveMint, firstFetch_accountsData.find((c) => c.pubkey.equals(r.reserveMint)).data);
		r.settleExecuted = currentOtcStateAccount.settleExecuted;
		if (r.settleExecuted) {
			const currentTrancheConfigStateAccount = vyperCoreProgram.coder.accounts.decode<IdlAccounts<VyperCore>['trancheConfig']>(
				'trancheConfig',
				firstFetch_accountsData.find((c) => c.pubkey.equals(r.vyperCoreTrancheConfig)).data.data
			);

			// @ts-expect-error
			r.pricesAtSettlement = currentTrancheConfigStateAccount.trancheData.reserveFairValue.value
				.filter((c) => c)
				.map((c) => new RustDecimalWrapper(new Uint8Array(c)).toNumber());
		}

		r.programBuyerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);
		r.programSellerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);

		r.buyerTA = currentOtcStateAccount.seniorSideBeneficiary;
		if (r.buyerTA) r.buyerWallet = secondFetch_accountsData.find((c) => c.address.equals(r.buyerTA)).owner;
		r.sellerTA = currentOtcStateAccount.juniorSideBeneficiary;
		if (r.sellerTA) r.sellerWallet = secondFetch_accountsData.find((c) => c.address.equals(r.sellerTA)).owner;

		// * * * * * * * * * * * * * * * * * * * * * * *
		// RATE PLUGIN
		// * * * * * * * * * * * * * * * * * * * * * * *

		if (r.rateAccount.state.typeId === 'switchboard') {
			// * * * * * * * * * * * * * * * * * * * * * * *
			// SWITCHBOARD

			const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
			(r.rateAccount.state as RateSwitchboardState).aggregatorsData = (r.rateAccount.state as RateSwitchboardState).oracles.map((c) =>
				switchboardProgram.coder.accounts.decode('AggregatorAccountData', firstFetch_accountsData.find((cc) => c.equals(cc.pubkey)).data.data)
			);
		} else if (r.rateAccount.state.typeId === 'pyth') {
			// * * * * * * * * * * * * * * * * * * * * * * *
			// PYTH

			await (r.rateAccount.state as RatePythState).loadData(connection);
		}

		res.push(r);
	}

	console.groupEnd();
	return res;
};

export default fetchContracts;

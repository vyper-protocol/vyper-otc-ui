/* eslint-disable camelcase */
/* eslint-disable no-console */
import { AnchorProvider, IdlAccounts, Program } from '@project-serum/anchor';
import { getMultipleAccounts, unpackMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount, loadSwitchboardProgram } from '@switchboard-xyz/switchboard-v2';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { selectContracts as supabaseSelectContracts } from 'api/supabase/selectContracts';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import _ from 'lodash';
import { AbsOtcState } from 'models/AbsOtcState';
import { ChainOtcState } from 'models/ChainOtcState';

import PROGRAMS from '../../configs/programs.json';
import { FetchContractsParams } from './FetchContractsParams';

const fetchContracts = async (connection: Connection, params: FetchContractsParams): Promise<ChainOtcState[]> => {
	console.group('CONTROLLER: fetch contracts');

	console.log('fetching contract from db');
	const dbEntries = await supabaseSelectContracts(params);
	console.log('fetched: ', dbEntries);

	const switchboardProgram = await loadSwitchboardProgram('devnet', connection);
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	// first fetch: otcState account, vyper core tranche account, reserveMint accounts

	const firstFetch_otcStateChainAccountPubkeys = dbEntries.map((c) => c.publickey);
	const firstFetch_vyperCoreTrancheConfig = dbEntries.map((c) => c.vyperCoreTrancheConfig);
	const firstFetch_reserveMintAccountPubkeys = dbEntries.map((c) => c.reserveMint);
	const firstFetch_switchboardAggregators = dbEntries.map((c) => c.rateState.switchboardAggregator);

	const firstFetch_unionPubkeys = _.uniq([
		...firstFetch_otcStateChainAccountPubkeys,
		...firstFetch_vyperCoreTrancheConfig,
		...firstFetch_reserveMintAccountPubkeys,
		...firstFetch_switchboardAggregators
	]) as PublicKey[];
	const firstFetch_accountsData = (await connection.getMultipleAccountsInfo(firstFetch_unionPubkeys)).map((c, i) => ({
		pubkey: firstFetch_unionPubkeys[i],
		data: c
	}));

	const firstFetch_otcStateAccountInfos = firstFetch_accountsData
		.filter((c) => firstFetch_otcStateChainAccountPubkeys.map((f) => f.toBase58()).includes(c.pubkey.toBase58()))
		.map((c) => vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>('otcState', c.data.data));

	// second fetch: otcSeniorReserveTokenAccount, otcJuniorReserveTokenAccount, seniorSideBeneficiary, juniorSideBeneficiary

	const secondFetch_TAPubkeys = [];
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.otcSeniorReserveTokenAccount));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.otcJuniorReserveTokenAccount));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.seniorSideBeneficiary));
	secondFetch_TAPubkeys.push(...firstFetch_otcStateAccountInfos.map((c) => c.juniorSideBeneficiary));

	const secondFetch_unionPubkeys = _.uniq(secondFetch_TAPubkeys.filter((c) => c != null)) as PublicKey[];
	const secondFetch_accountsData = await getMultipleAccounts(connection, secondFetch_unionPubkeys);

	const res: ChainOtcState[] = [];
	for (let i = 0; i < dbEntries.length; i++) {
		const r = dbEntries[i] as AbsOtcState as ChainOtcState;

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

			// @ts-ignore
			r.priceAtSettlement = new RustDecimalWrapper(new Uint8Array(currentTrancheConfigStateAccount.trancheData.reserveFairValue.value[0])).toNumber();
		}

		r.programBuyerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);
		r.programSellerTAAmount = Number(secondFetch_accountsData.find((c) => c.address.equals(currentOtcStateAccount.otcSeniorReserveTokenAccount)).amount);

		r.buyerTA = currentOtcStateAccount.seniorSideBeneficiary;
		if (r.buyerTA) r.buyerWallet = secondFetch_accountsData.find((c) => c.address.equals(r.buyerTA)).owner;
		r.sellerTA = currentOtcStateAccount.juniorSideBeneficiary;
		if (r.sellerTA) r.buyerWallet = secondFetch_accountsData.find((c) => c.address.equals(r.sellerTA)).owner;

		// switchboard
		r.rateState.aggregatorData = AggregatorAccount.decode(
			switchboardProgram,
			firstFetch_accountsData.find((c) => c.pubkey.equals(r.rateState.switchboardAggregator)).data
		);
		r.rateState.aggregatorLastValue = (
			await new AggregatorAccount({ program: switchboardProgram, publicKey: r.rateState.switchboardAggregator }).getLatestValue(r.rateState.aggregatorData)
		).toNumber();

		res.push(r);
	}

	console.log('fetch result: ', res);

	console.groupEnd();
	return res;
};

export default fetchContracts;

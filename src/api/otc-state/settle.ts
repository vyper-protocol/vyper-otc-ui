/* eslint-disable camelcase */
import { AnchorProvider, Program, utils } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { RatePyth, IDL as RatePythIDL } from 'idls/rate_pyth';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { TxPackage } from 'models/TxPackage';

import PROGRAMS from '../../configs/programs.json';

/**
 * OTC settlement
 * @param provider anchor provider with connection and user wallet
 * @param otcState public key of the current otc state
 * @returns transaction package ready to submit
 */
export const settle = async (provider: AnchorProvider, otcState: PublicKey): Promise<TxPackage> => {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), provider);

	const [otcAuthority] = await PublicKey.findProgramAddress([otcState.toBuffer(), utils.bytes.utf8.encode('authority')], vyperOtcProgram.programId);

	const otcStateAccountInfo = await vyperOtcProgram.account.otcState.fetch(otcState);
	const vyperCoreAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(otcStateAccountInfo.vyperTrancheConfig);

	let plugin_ix: TransactionInstruction = undefined;
	if (vyperCoreAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID))) {
		const rateSwitchboardProgram = new Program<RateSwitchboard>(RateSwitchboardIDL, vyperCoreAccountInfo.rateProgram, provider);
		const rateSwitchboardAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(vyperCoreAccountInfo.rateProgramState);
		plugin_ix = await rateSwitchboardProgram.methods
			.refresh()
			.accounts({
				rateData: vyperCoreAccountInfo.rateProgramState
			})
			.remainingAccounts(
				(rateSwitchboardAccountInfo.switchboardAggregators as (null | PublicKey)[])
					.filter((c) => {
						return c !== null;
					})
					.map((c) => {
						return { pubkey: c, isSigner: false, isWritable: false };
					})
			)
			.instruction();
	}

	if (vyperCoreAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_PYTH_PROGRAM_ID))) {
		const ratePythProgram = new Program<RatePyth>(RatePythIDL, vyperCoreAccountInfo.rateProgram, provider);
		const ratePythAccountInfo = await ratePythProgram.account.rateState.fetch(vyperCoreAccountInfo.rateProgramState);
		plugin_ix = await ratePythProgram.methods
			.refresh()
			.accounts({
				rateData: vyperCoreAccountInfo.rateProgramState
			})
			.remainingAccounts(
				(ratePythAccountInfo.pythOracles as (null | PublicKey)[])
					.filter((c) => {
						return c !== null;
					})
					.map((c) => {
						return { pubkey: c, isSigner: false, isWritable: false };
					})
			)
			.instruction();
	}

	const vc_ix = await vyperCoreProgram.methods
		.refreshTrancheFairValue()
		.accounts({
			trancheConfig: otcStateAccountInfo.vyperTrancheConfig,
			seniorTrancheMint: vyperCoreAccountInfo.seniorTrancheMint,
			juniorTrancheMint: vyperCoreAccountInfo.juniorTrancheMint,
			rateProgramState: vyperCoreAccountInfo.rateProgramState,
			redeemLogicProgram: vyperCoreAccountInfo.redeemLogicProgram,
			redeemLogicProgramState: vyperCoreAccountInfo.redeemLogicProgramState
		})
		.instruction();
	return {
		tx: await vyperOtcProgram.methods
			.settle()
			.accounts({
				otcState,
				otcAuthority,

				otcSeniorReserveTokenAccount: otcStateAccountInfo.otcSeniorReserveTokenAccount,
				otcJuniorReserveTokenAccount: otcStateAccountInfo.otcJuniorReserveTokenAccount,
				otcSeniorTrancheTokenAccount: otcStateAccountInfo.otcSeniorTrancheTokenAccount,
				otcJuniorTrancheTokenAccount: otcStateAccountInfo.otcJuniorTrancheTokenAccount,

				reserveMint: vyperCoreAccountInfo.reserveMint,
				seniorTrancheMint: vyperCoreAccountInfo.seniorTrancheMint,
				juniorTrancheMint: vyperCoreAccountInfo.juniorTrancheMint,

				vyperTrancheConfig: otcStateAccountInfo.vyperTrancheConfig,
				vyperTrancheAuthority: vyperCoreAccountInfo.trancheAuthority,
				vyperReserve: vyperCoreAccountInfo.reserve,
				vyperCore: vyperCoreProgram.programId
			})
			.preInstructions([plugin_ix, vc_ix])
			.transaction(),
		description: 'Settle'
	};
};

import { AnchorProvider, Program, utils } from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { TxPackage } from 'models/TxPackage';

import PROGRAMS from '../../configs/programs.json';

/**
 * Deposit assets in the otc state containter
 * @param provider anchor provider with connection and user wallet
 * @param otcState public key of the current otc state
 * @param isSeniorSide flag: if true the user will deposit as senior, otherwise as junior
 * @returns transaction package ready to submit
 */
export const deposit = async (
	provider: AnchorProvider,
	otcState: PublicKey,
	isSeniorSide: boolean
): Promise<TxPackage> => {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(
		VyperCoreIDL,
		new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID),
		provider
	);
	const rateSwitchboardProgram = new Program<RateSwitchboard>(
		RateSwitchboardIDL,
		new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID),
		provider
	);

	const [otcAuthority] = await PublicKey.findProgramAddress(
		[otcState.toBuffer(), utils.bytes.utf8.encode('authority')],
		vyperOtcProgram.programId
	);

	const otcStateAccountInfo = await vyperOtcProgram.account.otcState.fetch(otcState);
	const vyperCoreAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(
		otcStateAccountInfo.vyperTrancheConfig
	);
	const rateSwitchboardAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(
		vyperCoreAccountInfo.rateProgramState
	);

	const atokenAccount = await getAssociatedTokenAddress(
		new PublicKey(vyperCoreAccountInfo.reserveMint),
		provider.wallet.publicKey
	);

	const otcDepositTx: TxPackage = {
		tx: await vyperOtcProgram.methods
			.deposit({
				isSeniorSide
			})
			.accounts({
				userReserveTokenAccount: atokenAccount,
				beneficiaryTokenAccount: atokenAccount,
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
			.preInstructions([
				await rateSwitchboardProgram.methods
					.refresh()
					.accounts({
						rateData: vyperCoreAccountInfo.rateProgramState
					})
					.remainingAccounts(
						(rateSwitchboardAccountInfo.switchboardAggregators as (null | PublicKey)[])
							.filter((c) => {
								return c != null;
							})
							.map((c) => {
								return { pubkey: c, isSigner: false, isWritable: false };
							})
					)
					.instruction(),
				await vyperCoreProgram.methods
					.refreshTrancheFairValue()
					.accounts({
						trancheConfig: otcStateAccountInfo.vyperTrancheConfig,
						seniorTrancheMint: vyperCoreAccountInfo.seniorTrancheMint,
						juniorTrancheMint: vyperCoreAccountInfo.juniorTrancheMint,
						rateProgramState: vyperCoreAccountInfo.rateProgramState,
						redeemLogicProgram: vyperCoreAccountInfo.redeemLogicProgram,
						redeemLogicProgramState: vyperCoreAccountInfo.redeemLogicProgramState
					})
					.instruction()
			])
			.transaction(),
		description: 'Deposit'
	};

	return otcDepositTx;
};

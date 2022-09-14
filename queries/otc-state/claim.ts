import { AnchorProvider, Program, utils } from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { TxPackage } from 'models/TxPackage';
import PROGRAMS from '../../configs/programs.json';

/**
 * OTC claim
 * @param provider anchor provider with connection and user wallet
 * @param otcState public key of the current otc state
 * @returns transaction package ready to submit
 */
export const claim = async (provider: AnchorProvider, otcState: PublicKey): Promise<TxPackage> => {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(
		VyperCoreIDL,
		new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID),
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

	const atokenAccount = await getAssociatedTokenAddress(
		new PublicKey(vyperCoreAccountInfo.reserveMint),
		provider.wallet.publicKey
	);

	return {
		tx: await vyperOtcProgram.methods
			.claim()
			.accounts({
				otcAuthority,
				otcState,
				beneficiaryTokenAccount: atokenAccount,
				otcSeniorReserveTokenAccount: otcStateAccountInfo.otcSeniorReserveTokenAccount,
				otcJuniorReserveTokenAccount: otcStateAccountInfo.otcJuniorReserveTokenAccount
			})
			.transaction(),
		description: 'Claim Assets'
	};
};

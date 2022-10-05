import { AnchorProvider, Program, utils } from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { TxPackage } from 'models/TxPackage';

import PROGRAMS from '../../configs/programs.json';

/**
 * OTC withdraw
 * @param provider anchor provider with connection and user wallet
 * @param otcState public key of the current otc state
 * @returns transaction package ready to submit
 */
export const withdraw = async (provider: AnchorProvider, otcState: PublicKey): Promise<TxPackage> => {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), provider);

	const [otcAuthority] = await PublicKey.findProgramAddress([otcState.toBuffer(), utils.bytes.utf8.encode('authority')], vyperOtcProgram.programId);

	const otcStateAccountInfo = await vyperOtcProgram.account.otcState.fetch(otcState);
	const vyperCoreAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(otcStateAccountInfo.vyperTrancheConfig);

	const atokenAccount = await getAssociatedTokenAddress(new PublicKey(vyperCoreAccountInfo.reserveMint), provider.wallet.publicKey);

	return {
		tx: await vyperOtcProgram.methods
			.withdraw()
			.accounts({
				otcAuthority,
				otcState,
				reserveMint: vyperCoreAccountInfo.reserveMint,
				userReserveTokenAccount: atokenAccount,
				beneficiaryTokenAccount: atokenAccount,
				otcSeniorReserveTokenAccount: otcStateAccountInfo.otcSeniorReserveTokenAccount,
				otcJuniorReserveTokenAccount: otcStateAccountInfo.otcJuniorReserveTokenAccount,
				signer: provider.wallet.publicKey
			})
			.transaction(),
		description: 'Withdraw Assets'
	};
};

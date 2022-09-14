import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { TxPackage } from 'models/TxPackage';

/**
 * OTC withdraw
 * @param provider anchor provider with connection and user wallet
 * @param otcState public key of the current otc state
 * @returns transaction package ready to submit
 */
export const withdraw = async (provider: AnchorProvider, otcState: PublicKey): Promise<TxPackage> => {
	throw Error('withdraw instrction not implemented yet');
};

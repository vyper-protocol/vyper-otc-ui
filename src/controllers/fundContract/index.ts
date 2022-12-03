/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import { TxHandler } from 'components/providers/TxHandlerProvider';

export const fundContract = async (provider: AnchorProvider, txHandler: TxHandler, contractPublicKey: PublicKey, isBuyer: boolean) => {
	try {
		console.group(`CONTROLLER: ${isBuyer ? 'long' : 'short'} contract`);
		console.log('create txs');
		const txs = await deposit(provider, contractPublicKey, isBuyer);

		console.log('submit txs');
		await txHandler.handleTxs(txs);
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

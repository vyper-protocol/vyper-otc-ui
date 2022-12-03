/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { settle } from 'api/otc-state/settle';
import { TxHandler } from 'components/providers/TxHandlerProvider';

export const settleContract = async (provider: AnchorProvider, txHandler: TxHandler, contractPublicKey: PublicKey) => {
	try {
		console.group('CONTROLLER: settle contract');
		console.log('create txs');
		const txs = await settle(provider, contractPublicKey);

		console.log('submit txs');
		await txHandler.handleTxs(txs);
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

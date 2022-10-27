/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { settle } from 'api/otc-state/settle';
import { buildContractSettledMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import * as UrlBuilder from 'utils/urlBuilder';

export const settleContract = async (provider: AnchorProvider, txHandler: TxHandler, contractPublicKey: PublicKey, sendNotification: boolean = false) => {
	try {
		console.group('CONTROLLER: settle contract');
		console.log('create txs');
		const txs = await settle(provider, contractPublicKey);

		console.log('submit txs');
		await txHandler.handleTxs(txs);

		const contractURL = UrlBuilder.buildContractSummaryUrl(contractPublicKey.toBase58());
		const cluster = getCurrentCluster();

		// send sns publish
		if (sendNotification) {
			console.log('send notification');
			sendSnsPublisherNotification(cluster, buildContractSettledMessage(contractPublicKey.toBase58(), `https://otc.vyperprotocol.io${contractURL}`));
		}
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

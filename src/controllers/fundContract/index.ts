/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import { buildContractFundedMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import * as UrlBuilder from 'utils/urlBuilder';

export const fundContract = async (
	provider: AnchorProvider,
	txHandler: TxHandler,
	contractPublicKey: PublicKey,
	isSeniorSide: boolean,
	sendNotification: boolean = false
) => {
	try {
		console.group(`CONTROLLER: ${isSeniorSide ? 'long' : 'short'} contract`);
		console.log('create txs');
		const txs = await deposit(provider, contractPublicKey, isSeniorSide);

		console.log('submit txs');
		await txHandler.handleTxs(txs);

		const contractURL = UrlBuilder.buildContractSummaryUrl(contractPublicKey.toBase58());
		const cluster = getCurrentCluster();

		// send sns publish
		if (sendNotification) {
			console.log('send notification');
			sendSnsPublisherNotification(
				cluster,
				buildContractFundedMessage(contractPublicKey.toBase58(), isSeniorSide, `https://otc.vyperprotocol.io${contractURL}`)
			);
		}
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

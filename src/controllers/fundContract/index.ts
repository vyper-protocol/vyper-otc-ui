/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import { buildContractFundedMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { ChainOtcState } from 'models/ChainOtcState';
import * as UrlBuilder from 'utils/urlBuilder';

export const fundContract = async (
	provider: AnchorProvider,
	txHandler: TxHandler,
	contractPublicKey: PublicKey,
	otcState: ChainOtcState,
	isLong: boolean,
	sendNotification: boolean
) => {
	try {
		console.group(`CONTROLLER: ${isLong ? 'long' : 'short'} contract`);
		console.log('create txs');
		const txs = await deposit(provider, contractPublicKey, isLong);

		console.log('submit txs');
		await txHandler.handleTxs(txs);

		if (sendNotification) {
			const cluster = getCurrentCluster();
			const contractURL = UrlBuilder.buildFullUrl(cluster, UrlBuilder.buildContractSummaryUrl(contractPublicKey.toBase58()));
			const isSecondSide = (isLong && otcState.isShortFunded()) || (!isLong && otcState.isLongFunded());

			const notification = buildContractFundedMessage(otcState, isLong, isSecondSide, cluster, contractURL);
			sendSnsPublisherNotification(cluster, notification);
		}
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

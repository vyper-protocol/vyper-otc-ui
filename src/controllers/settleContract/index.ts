/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { settle } from 'api/otc-state/settle';
import { buildContractSettledMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { ChainOtcState } from 'models/ChainOtcState';
import * as UrlBuilder from 'utils/urlBuilder';

export const settleContract = async (
	provider: AnchorProvider,
	txHandler: TxHandler,
	contractPublicKey: PublicKey,
	otcState: ChainOtcState,
	sendNotification: boolean
) => {
	try {
		console.group('CONTROLLER: settle contract');
		console.log('create txs');
		const txs = await settle(provider, contractPublicKey);

		console.log('submit txs');
		await txHandler.handleTxs([txs]);

		if (sendNotification && otcState.settleExecuted && otcState.pricesAtSettlement) {
			const cluster = getCurrentCluster();
			const contractURL = UrlBuilder.buildFullUrl(cluster, UrlBuilder.buildContractSummaryUrl(contractPublicKey.toBase58()));
			const settlementPrices = otcState.pricesAtSettlement;

			const pnlLong = otcState.getLongPnl(settlementPrices);
			const pnlShort = otcState.getShortPnl(settlementPrices);

			const notification = buildContractSettledMessage(otcState, pnlLong, pnlShort, cluster, contractURL);
			sendSnsPublisherNotification(cluster, notification);
		}
	} catch (err) {
		console.error(err);
	} finally {
		console.groupEnd();
	}
};

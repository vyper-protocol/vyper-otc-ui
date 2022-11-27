/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { create } from 'api/otc-state/create';
import { cloneContractFromChain as supabaseInsertContract } from 'api/supabase/insertContract';
import { buildCreateContractMessage as buildCreateContractMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { fetchContract } from 'controllers/fetchContract';
import { ChainOtcState } from 'models/ChainOtcState';
import * as UrlBuilder from 'utils/urlBuilder';

import { OtcInitializationParams } from './OtcInitializationParams';

const MAX_RETRIES = 30;
const RETRY_TIMEOUT = 1000;

const createContract = async (provider: AnchorProvider, txHandler: TxHandler, initParams: OtcInitializationParams): Promise<PublicKey> => {
	console.group('CONTROLLER: create contract');
	console.log('create txs');
	const [txs, otcPublicKey] = await create(provider, initParams);
	console.log('otcPublicKey: ' + otcPublicKey);

	console.log('submit txs');
	await txHandler.handleTxs(...txs);

	try {
		const cluster = getCurrentCluster();
		let chainOtcState: ChainOtcState = undefined;

		if (initParams.saveOnDatabase) {
			for (let i = 0; i < MAX_RETRIES; i++) {
				try {
					// override commitment to go as fast as we can 🏎️
					const conn = new Connection(provider.connection.rpcEndpoint, { commitment: 'processed' });
					chainOtcState = await fetchContract(conn, otcPublicKey, true);
				} catch {}

				if (chainOtcState === undefined) {
					console.warn(`chain data not fetched, sleep ${RETRY_TIMEOUT}ms and retry. ${i + 1}/${MAX_RETRIES}`);
					await sleep(RETRY_TIMEOUT);
				} else {
					break;
				}
			}

			if (chainOtcState === undefined) {
				console.error('cannot fetch chain data yet');
				throw Error('cannot fetch chain data yet');
			} else {
				console.log('saving contract on db');
				await supabaseInsertContract(chainOtcState, provider.wallet.publicKey, cluster);
			}
		}

		if (initParams.sendNotification) {
			if (!chainOtcState) {
				chainOtcState = await fetchContract(provider.connection, otcPublicKey, true);
			}

			const contractURL = UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58());

			// send sns publish
			sendSnsPublisherNotification(
				cluster,
				buildCreateContractMessage(
					chainOtcState.redeemLogicAccount.state,
					chainOtcState.rateAccount.state,
					chainOtcState.settleAvailableFromAt,
					`https://otc.vyperprotocol.io${contractURL}`
				)
			);
		}
	} catch (err) {
		console.error(err);
	}

	console.log('controller completed');
	console.groupEnd();
	return otcPublicKey;
};

export default createContract;

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

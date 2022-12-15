/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { create } from 'api/otc-state/create';
import { deposit } from 'api/otc-state/deposit';
import { cloneContractFromChain as supabaseInsertContract } from 'api/supabase/insertContract';
import { buildCreateContractMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { fetchContract } from 'controllers/fetchContract';
import { fundContract } from 'controllers/fundContract';
import { ChainOtcState } from 'models/ChainOtcState';
import { sleep } from 'utils/sleep';
import * as UrlBuilder from 'utils/urlBuilder';

import { OtcInitializationParams } from './OtcInitializationParams';

const MAX_RETRIES = 30;
const RETRY_TIMEOUT = 1000;

const createContract = async (
	provider: AnchorProvider,
	txHandler: TxHandler,
	initParams: OtcInitializationParams,
	buySide?: 'long' | 'short'
): Promise<PublicKey> => {
	console.group('CONTROLLER: create contract');
	console.log('create txs');
	const [txs, otcPublicKey] = await create(provider, initParams);
	console.log('otcPublicKey: ' + otcPublicKey);

	console.log('submit txs');
	if (buySide) await txHandler.handleTxs(txs, 0, 3);
	else await txHandler.handleTxs(txs);

	try {
		const cluster = getCurrentCluster();
		let chainOtcState: ChainOtcState = undefined;

		if (initParams.saveOnDatabase) {
			for (let i = 0; i < MAX_RETRIES; i++) {
				try {
					// override commitment to go as fast as we can 🏎️
					const conn = new Connection(provider.connection.rpcEndpoint, { commitment: 'processed' });
					const { chainData } = await fetchContract(conn, otcPublicKey, true);
					chainOtcState = chainData;
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
				const createdBy = provider.wallet.publicKey;
				const aliasId = initParams.aliasId ?? initParams.payoffOption.payoffId;

				await supabaseInsertContract(chainOtcState, createdBy, aliasId, cluster);
			}
		}

		if (buySide) {
			const buySideTxs = await deposit(provider, otcPublicKey, buySide === 'long');
			await txHandler.handleTxs([buySideTxs], 2, 3);
		}

		if (initParams.sendNotification) {
			const contractURL = UrlBuilder.buildFullUrl(cluster, UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58()));
			const notification = buildCreateContractMessage(initParams, cluster, contractURL);
			sendSnsPublisherNotification(cluster, notification);
		}
	} catch (err) {
		console.error(err);
	}

	console.log('controller completed');
	console.groupEnd();
	return otcPublicKey;
};

export default createContract;

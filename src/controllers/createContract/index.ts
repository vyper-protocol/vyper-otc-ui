/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { create } from 'api/otc-state/create';
import { cloneContractFromChain as supabaseInsertContract } from 'api/supabase/insertContract';
import { buildMessage as buildCreateContractMessage, sendSnsPublish } from 'api/supabase/notificationTrigger';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { DEFAULT_CLUSTER } from 'components/providers/UrlClusterBuilderProvider';
import { fetchContract } from 'controllers/fetchContract';
import { getClusterFromRpcEndpoint } from 'utils/clusterHelpers';

import { OtcInitializationParams } from './OtcInitializationParams';

const createContract = async (provider: AnchorProvider, txHandler: TxHandler, initParams: OtcInitializationParams): Promise<PublicKey> => {
	console.group('CONTROLLER: create contract');
	console.log('create txs');
	const [txs, otcPublicKey] = await create(provider, initParams);
	console.log('otcPublicKey: ' + otcPublicKey);

	console.log('submit txs');
	await txHandler.handleTxs(...txs);

	try {
		await sleep(1000);
		console.log('saving contract on db');
		const chianOtcState = await fetchContract(provider.connection, otcPublicKey, true);
		const cluster = getClusterFromRpcEndpoint(provider.connection.rpcEndpoint);
		await supabaseInsertContract(chianOtcState, provider.wallet.publicKey, cluster);

		// send sns publish
		sendSnsPublish(
			cluster,
			buildCreateContractMessage(
				chianOtcState.redeemLogicState.getTypeId(),
				chianOtcState.rateState.getPluginDescription(),
				chianOtcState.redeemLogicState.strike,
				chianOtcState.redeemLogicState.notional,
				chianOtcState.settleAvailableFromAt,
				`https://otc.vyperprotocol.io/contract/summary/${otcPublicKey}${cluster !== DEFAULT_CLUSTER ? '?cluster=' + cluster : ''}`
			)
		);
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

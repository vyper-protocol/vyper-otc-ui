/* eslint-disable no-console */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { create } from 'api/otc-state/create';
import { cloneContractFromChain as supabaseInsertContract } from 'api/supabase/insertContract';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { fetchContract } from 'controllers/fetchContract';

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
		await supabaseInsertContract(chianOtcState, provider.wallet.publicKey);
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

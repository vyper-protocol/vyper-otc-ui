/* eslint-disable no-console */
import { AnchorError, AnchorProvider, Wallet } from '@project-serum/anchor';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@switchboard-xyz/switchboard-v2';
import { airdrop, MINT_ADDRESS_DEVNET } from 'api/dummy-tokens/airdrop';
import { create } from 'api/otc-state/create';
import { deposit } from 'api/otc-state/deposit';
import { cloneContractFromChain as supabaseInsertContract } from 'api/supabase/insertContract';
import { buildCreateContractMessage, sendSnsPublisherNotification } from 'api/supabase/notificationTrigger';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandler } from 'components/providers/TxHandlerProvider';
import { fetchContract } from 'controllers/fetchContract';
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
	fundSide?: 'long' | 'short',
	autoFundSide?: 'long' | 'short'
): Promise<PublicKey> => {
	console.group('CONTROLLER: create contract');
	console.log('create txs');
	const [txs, otcPublicKey] = await create(provider, initParams, fundSide);
	console.log('otcPublicKey: ' + otcPublicKey);

	console.log('submit txs');
	await txHandler.handleTxs(txs);

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

		if (initParams.sendNotification) {
			const contractURL = UrlBuilder.buildFullUrl(cluster, UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58()));
			const notification = buildCreateContractMessage(initParams, cluster, contractURL);
			sendSnsPublisherNotification(cluster, notification);
		}

		if (autoFundSide) {
			if (getCurrentCluster() !== 'devnet') {
				throw new Error('requested contract autoFund but cluster is: ' + getCurrentCluster());
			}

			await autoFundContractSide(otcPublicKey, autoFundSide);
		}
	} catch (err) {
		console.error(err);
	}

	console.log('controller completed');
	console.groupEnd();
	return otcPublicKey;
};

export default createContract;

export async function autoFundContractSide(contractPubkey: PublicKey, autoFundSide: 'long' | 'short'): Promise<void> {
	console.group('auto fund contract side ' + contractPubkey);

	// creating conncetion to public devnet endpoint
	const connection = new Connection(clusterApiUrl('devnet'), 'single');
	const latestBlockhash = await connection.getLatestBlockhash();

	// check if collateral mint is vyper devUSD
	const contractChainData = await fetchContract(connection, contractPubkey, false, false);
	if (!contractChainData.chainData.collateralMint.equals(MINT_ADDRESS_DEVNET)) throw new Error('collateral mint isnt devUSD');

	// creating temp wallet and airdrop some sol
	const tempWallet = Keypair.generate();
	console.log('temp wallet used for signing: ' + tempWallet.publicKey);
	const tempProvider = new AnchorProvider(connection, new AnchorWallet(tempWallet), {});

	console.log('request airdrop...');
	const airdropSig = await connection.requestAirdrop(tempWallet.publicKey, LAMPORTS_PER_SOL);
	console.log('airdrop sig: ', airdropSig);

	console.log('confirming sig...');
	await connection.confirmTransaction({
		signature: airdropSig,
		...latestBlockhash
	});
	console.log('sig confirmed');

	// airdrop devUSD tokens
	const devUsdRequiredAmount = autoFundSide === 'long' ? contractChainData.chainData.buyerDepositAmount : contractChainData.chainData.sellerDepositAmount;
	console.log(`airdrop ${devUsdRequiredAmount} devUSD tokens...`);
	const devUsdAirdropTxPackage = await airdrop(
		connection,
		tempWallet.publicKey,
		devUsdRequiredAmount * 10 ** contractChainData.chainData.collateralMintInfo.decimals
	);
	console.log('send and confirm...');
	const devUsdAirdropSig = await tempProvider.sendAndConfirm(devUsdAirdropTxPackage.tx, devUsdAirdropTxPackage.signers);
	console.log('airdrop devUSD sig: ', devUsdAirdropSig);

	// deposit tokens
	try {
		console.log('creating deposit tx...');
		const depositTxPackage = await deposit(tempProvider, contractPubkey, autoFundSide === 'long');
		console.log('send and confirm...');
		const depositSig = await tempProvider.sendAndConfirm(depositTxPackage.tx, depositTxPackage.signers);
		console.log('deposit sig: ', depositSig);
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			if (err.logs) {
				console.groupCollapsed('TX ERROR LOGS');
				err.logs.forEach((errLog) => console.error(errLog));
				console.groupEnd();

				const anchorError = AnchorError.parse(err.logs);
				if (anchorError) {
					console.warn('anchor error: ', anchorError);
				}
			} else {
				console.warn('error: ', JSON.stringify(err));
			}
		}

		throw err;
	}
	console.groupEnd();
}

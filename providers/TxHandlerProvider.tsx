/* eslint-disable no-magic-numbers */
/* eslint-disable no-await-in-loop */
import { createContext } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, ConfirmOptions, SendOptions, clusterApiUrl } from '@solana/web3.js';
import { TxPackage } from 'models/TxPackage';
import { toaster } from 'evergreen-ui';

export type TxHandler = {
	handleTxs: (...txs: TxPackage[]) => Promise<void>;
};

export const TxHandlerContext = createContext<TxHandler>(undefined);

export const TxHandlerProvider = ({ children }) => {
	// Establish a connection with the chain
	const { connection } = useConnection();

	// Init Solana wallet
	const wallet = useWallet();

	// Init Anchor
	// const provider = new AnchorProvider(connection, wallet, {});
	const confirmOptions: ConfirmOptions = {
		preflightCommitment: 'processed',
		commitment: 'processed'
	};
	const sendOptions: SendOptions = confirmOptions && {
		skipPreflight: confirmOptions.skipPreflight,
		preflightCommitment: confirmOptions.preflightCommitment || confirmOptions.commitment
	};

	const handleTxs = async (...txs: TxPackage[]) => {
		console.log('getting latest blockhash');
		const recentBlockhash = (await connection.getLatestBlockhash(confirmOptions.preflightCommitment)).blockhash;
		console.log('recentBlockhash: ', recentBlockhash);

		for (let i = 0; i < txs.length; i++) {
			console.group(`sending tx# ${i + 1} / ${txs.length} `);

			let { tx, signers, description } = txs[i];
			try {
				if (description) console.log('description: ' + description);
				description = description ? ' | ' + description : '';

				tx.feePayer = wallet.publicKey;
				tx.recentBlockhash = recentBlockhash;

				toaster.warning(`Signing tx ${i + 1} / ${txs.length} ${description}`, {
					hasCloseButton: false,
					id: description
				});
				console.log('signing txs...');
				tx = await wallet.signTransaction(tx);
				(signers ?? []).forEach((kp) => {
					tx.partialSign(kp);
				});

				console.log('sending...');
				const signature = await connection.sendRawTransaction(tx.serialize(), sendOptions);
				console.log('signature: ', signature);

				console.log('confirming...');
				toaster.notify(`Confirming tx ${i + 1} / ${txs.length} ${description}`, {
					hasCloseButton: false,
					id: description
				});
				// enqueueTempSnackbar(`Confirming tx ${i + 1} / ${txs.length} ${description}`);
				const signatureResult = await connection.confirmTransaction(signature, confirmOptions.commitment);

				if (signatureResult.value.err) {
					throw Error('error: ' + signatureResult.value.err);
				}

				console.log('processed in slot: ', signatureResult.context.slot);

				// TODO add the "open in explorer button"
				toaster.success(`Transaction sent ${i + 1} / ${txs.length} ${description}`, {
					hasCloseButton: true,
					id: description
				});
				// enqueueSnackbar(`Transaction sent ${i + 1} / ${txs.length} ${description}`, {
				// 	variant: 'success',
				// 	autoHideDuration: 8000,
				// 	action: (k) => {
				// 		return (
				// 			<p
				// 				onClick={() => {
				// 					window.open(getExplorerLink('tx', signature, 'devnet'));
				// 				}}
				// 				style={{
				// 					color: 'var(--color-black-300)',
				// 					cursor: 'pointer',
				// 					textDecoration: 'underline',
				// 					marginRight: 'var(--space-10)'
				// 				}}
				// 			>
				// 				{abbreviateAddress(signature)}
				// 			</p>
				// 		);
				// 	}
				// });
			} catch (err) {
				console.error('err: ', JSON.stringify(err));
				if (err.message) {
					toaster.danger(err.message, {
						id: description
					});
				} else {
					toaster.danger('Error sending transaction', {
						id: description
					});
				}

				throw Error('error: ', err);
			}
			console.groupEnd();
		}
	};

	const txHandler: TxHandler = {
		handleTxs
	};

	return <TxHandlerContext.Provider value={txHandler}>{children}</TxHandlerContext.Provider>;
};

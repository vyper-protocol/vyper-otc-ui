/* eslint-disable no-console */
import { createContext } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ConfirmOptions, SendOptions } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { TxPackage } from 'models/TxPackage';
import { Id, toast } from 'react-toastify';
import { getClusterFromRpcEndpoint } from 'utils/clusterHelpers';
import { abbreviateAddress } from 'utils/stringHelpers';

export type TxHandler = {
	// eslint-disable-next-line no-unused-vars
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

			let toastID: Id;

			const { signers } = txs[i];
			let { tx, description } = txs[i];
			try {
				if (description) console.log('description: ' + description);
				description = description ? ' | ' + description : '';

				tx.feePayer = wallet.publicKey;
				tx.recentBlockhash = recentBlockhash;

				toastID = toast.warn(`Signing tx ${i + 1} / ${txs.length} ${description}`, {
					autoClose: false,
					// icon: '📝',
					isLoading: true,
					closeButton: false
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

				toast.update(toastID, {
					render: `Confirming tx ${i + 1} / ${txs.length} ${description}`
				});

				const signatureResult = await connection.confirmTransaction(signature, confirmOptions.commitment);
				if (signatureResult.value.err) {
					throw Error('error: ' + signatureResult.value.err);
				}

				console.log('processed in slot: ', signatureResult.context.slot);

				toast.update(toastID, {
					render: `Transaction sent ${i + 1} / ${txs.length} ${description}. Processed in slot: ${signatureResult.context.slot}. Signature: ${abbreviateAddress(
						signature
					)}`,
					onClick: () => {
						window.open(getExplorerLink(signature, { explorer: 'solscan', cluster: getClusterFromRpcEndpoint(connection.rpcEndpoint) }));
					},
					type: toast.TYPE.SUCCESS,
					isLoading: false,
					closeOnClick: false,
					autoClose: 5000
				});
			} catch (err) {
				console.error('err: ', JSON.stringify(err));
				if (err.message) {
					toast.update(toastID, {
						render: err.message,
						icon: '❌',
						type: 'error',
						autoClose: 5000
					});
				} else {
					toast.update(toastID, {
						render: 'Error sending transaction',
						type: 'error',
						icon: '❌',
						autoClose: 5000
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

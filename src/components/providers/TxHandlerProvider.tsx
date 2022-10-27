/* eslint-disable no-console */
import { createContext } from 'react';

import { AnchorError } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ConfirmOptions, SendOptions } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import _ from 'lodash';
import { TxPackage } from 'models/TxPackage';
import { Id, toast } from 'react-toastify';
import { abbreviateAddress } from 'utils/stringHelpers';

import { getCurrentCluster } from './OtcConnectionProvider';

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
						window.open(getExplorerLink(signature, { explorer: 'solscan', cluster: getCurrentCluster() }));
					},
					type: toast.TYPE.SUCCESS,
					isLoading: false,
					closeOnClick: false,
					autoClose: 5000
				});
			} catch (err) {
				console.error('err: ', JSON.stringify(err));

				// print tx error logs
				if (err.logs) {
					console.groupCollapsed('TX ERROR LOGS');
					err.logs.forEach((errLog) => console.error(errLog));
					console.groupEnd();
				}

				const anchorError = AnchorError.parse(err.logs);
				if (anchorError) {
					if (process.env.NODE_ENV === 'development') {
						console.warn('error origin: ', anchorError.error.origin);
					}

					let toastMessage = `Transaction error: ${_.capitalize(anchorError.error.errorMessage)}`;

					if (process.env.NODE_ENV === 'development') {
						toastMessage = `Transaction error (${anchorError.error.errorCode.number} ${anchorError.error.errorCode.code}): ${_.capitalize(
							anchorError.error.errorMessage
						)}`;
					}

					toast.update(toastID, {
						render: toastMessage,
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

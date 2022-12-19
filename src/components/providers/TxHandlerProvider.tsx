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
	handleTxs: (txs: TxPackage[]) => Promise<void>;
};

export const TxHandlerContext = createContext<TxHandler>(undefined);

export const TxHandlerProvider = ({ children }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const confirmOptions: ConfirmOptions = {
		preflightCommitment: 'processed',
		commitment: 'processed'
	};
	const sendOptions: SendOptions = confirmOptions && {
		skipPreflight: confirmOptions.skipPreflight,
		preflightCommitment: confirmOptions.preflightCommitment || confirmOptions.commitment
	};

	const handleTxs = async (txs: TxPackage[]) => {
		console.log('getting latest blockhash');
		const latestBlockhash = await connection.getLatestBlockhash(confirmOptions.preflightCommitment);

		// * * * * * * * * * *
		// 1. CONFIG

		// setting fee payer and recentBlockhash
		txs.forEach((txPackage) => {
			txPackage.tx.feePayer = wallet.publicKey;
			txPackage.tx.recentBlockhash = latestBlockhash.blockhash;
		});

		// * * * * * * * * * *
		// 2. SIGNING

		const signedTransactions = await wallet.signAllTransactions(txs.map((t) => t.tx));

		// partial signing for other signers
		txs.forEach(({ signers }, i) => {
			(signers ?? []).forEach((kp) => {
				signedTransactions[i].partialSign(kp);
			});
		});

		// * * * * * * * * * *
		// 3. SENDING AND CONFIRMING

		for (let i = 0; i < txs.length; i++) {
			const { description } = txs[i];
			const toastID = toast.warn(`Sending tx ${i + 1} / ${txs.length} ${description}`, {
				autoClose: false,
				isLoading: true,
				closeButton: false
			});

			try {
				console.log(`sending tx ${i + 1}/${txs.length} ${description}`);

				console.log('serializing...');
				const serializedTx = signedTransactions[i].serialize();

				console.log('sending...');
				const signature = await connection.sendRawTransaction(serializedTx, sendOptions);
				console.log('signature: ', signature);

				console.log('confirming...');

				toast.update(toastID, {
					render: `Confirming tx ${i + 1} / ${txs.length} ${description}`
				});

				const signatureResult = await connection.confirmTransaction(
					{
						signature: signature,
						...latestBlockhash
					},
					confirmOptions.commitment
				);
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

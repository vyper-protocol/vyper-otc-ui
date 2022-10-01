import { Signer, Transaction } from '@solana/web3.js';

export type TxPackage = {
	tx: Transaction;
	signers?: Signer[];
	description?: string;
};

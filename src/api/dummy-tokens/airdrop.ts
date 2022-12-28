import { createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { TxPackage } from 'models/TxPackage';
import { accountExists } from 'utils/solanaHelper';

const MINT_AUTHORITY_KP = [
	97, 173, 71, 224, 183, 153, 116, 246, 214, 228, 103, 35, 150, 201, 47, 94, 189, 188, 146, 154, 122, 185, 236, 234, 116, 56, 97, 161, 117, 170, 218, 71, 8, 23,
	208, 253, 42, 86, 175, 160, 169, 41, 79, 58, 62, 182, 52, 28, 17, 230, 248, 89, 141, 182, 93, 198, 192, 164, 68, 171, 156, 88, 150, 28
];

export const MINT_ADDRESS_DEVNET = new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W');
export const DEV_USD_MINT_DECIMALS = 6;
const AIRDROP_AMOUNT = 1_000_000_000;

export const airdrop = async (connection: Connection, wallet: PublicKey, amount: number = AIRDROP_AMOUNT): Promise<TxPackage> => {
	const tx = new Transaction();

	const mintAddress = MINT_ADDRESS_DEVNET;

	const atokenAccount = await getAssociatedTokenAddress(new PublicKey(mintAddress), wallet);
	const exists = await accountExists(connection, atokenAccount);
	if (!exists) {
		tx.add(createAssociatedTokenAccountInstruction(wallet, atokenAccount, wallet, mintAddress));
	}

	const mintAuthority = Keypair.fromSecretKey(new Uint8Array(MINT_AUTHORITY_KP));
	tx.add(createMintToInstruction(new PublicKey(mintAddress), atokenAccount, mintAuthority.publicKey, amount));

	return {
		tx,
		signers: [mintAuthority]
	};
};

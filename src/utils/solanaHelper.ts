import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

export async function accountExists(c: Connection, a: PublicKey): Promise<boolean> {
	try {
		const info = await c.getAccountInfo(a);
		return info !== null && info !== undefined;
	} catch (err) {
		return false;
	}
}

export async function getTokenAmount(connection: Connection, accountPubKey: PublicKey, mintPubKey: PublicKey):Promise<bigint> {
	try {
		const atoken = await getAssociatedTokenAddress(mintPubKey, accountPubKey);
		const accountInfo = await getAccount(connection, atoken);
		return accountInfo.amount;
	} catch (err) {
		// token account not found
		return BigInt(0);
	}
}

import { getAssociatedTokenAddress, getAccount, getMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

export async function accountExists(c: Connection, a: PublicKey): Promise<boolean> {
	try {
		const info = await c.getAccountInfo(a);
		return info !== null && info !== undefined;
	} catch (err) {
		return false;
	}
}

export async function checkTokenAmount(connection: Connection, payerPubKey: PublicKey, mintPubKey: PublicKey, requiredAmount: number):Promise<boolean> {
	try {
		const atoken = await getAssociatedTokenAddress(mintPubKey, payerPubKey);
		const accountInfo = await getAccount(connection, atoken);
		const mintInfo = await getMint(connection, mintPubKey);
		if(accountInfo.amount / BigInt(10 ** mintInfo.decimals) >= requiredAmount) return true;
		else return false;
	} catch (err) {
		// token account not found
		return false;
	}
}

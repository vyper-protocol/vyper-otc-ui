import { Connection, PublicKey } from '@solana/web3.js';

export async function accountExists(c: Connection, a: PublicKey): Promise<boolean> {
	try {
		const info = await c.getAccountInfo(a);
		return info !== null && info !== undefined;
	} catch (err) {
		return false;
	}
}

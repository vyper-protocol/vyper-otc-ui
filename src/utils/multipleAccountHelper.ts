import { AccountInfo, Commitment, Connection, GetMultipleAccountsConfig, PublicKey } from '@solana/web3.js';

export type PubkeyAccountInfo = {
	pubkey: PublicKey;
	data: AccountInfo<Buffer>;
};
export async function getMultipleAccountsInfo(
	conn: Connection,
	pubkeys: PublicKey[],
	commitmentOrConfig?: Commitment | GetMultipleAccountsConfig
): Promise<PubkeyAccountInfo[]> {
	return (await conn.getMultipleAccountsInfo(pubkeys, commitmentOrConfig)).map((c, i) => ({ pubkey: pubkeys[i], data: c }));
}

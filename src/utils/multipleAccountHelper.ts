import { AccountInfo, Commitment, Connection, GetMultipleAccountsConfig, PublicKey } from '@solana/web3.js';
import _ from 'lodash';

export type PubkeyAccountInfo = {
	pubkey: PublicKey;
	data: AccountInfo<Buffer>;
};

export async function getMultipleAccountsInfo(
	conn: Connection,
	pubkeys: PublicKey[],
	commitmentOrConfig?: Commitment | GetMultipleAccountsConfig,
	chunkSize: number = 100
): Promise<PubkeyAccountInfo[]> {
	const accountInfos = await Promise.all(_.chunk(pubkeys, chunkSize).map((pubkeyChunk) => conn.getMultipleAccountsInfo(pubkeyChunk, commitmentOrConfig)));
	return _.flatten(accountInfos).map((c, i) => ({ pubkey: pubkeys[i], data: c }));
}

import { findMetadataPda } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { TokenListProvider } from '@solana/spl-token-registry';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getClusterEndpoint } from 'components/providers/OtcConnectionProvider';
import { TokenInfo } from 'models/TokenInfo';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		res.status(404);
		return;
	}

	try {
		const mint = new PublicKey(req.query.mint as string);
		const cluster = process.env.NEXT_PUBLIC_CLUSTER;
		const connection = new Connection(getClusterEndpoint(cluster as Cluster));
		const tokenInfo = await fetchTokenInfo(connection, mint);
		// console.log(tokenInfo);

		res.status(200).json(tokenInfo);
	} catch (err) {
		res.status(500).json({ err });
	}
}

const fetchTokenInfoFromMetaplex = async (connection: Connection, mint: PublicKey): Promise<TokenInfo | undefined> => {
	try {
		const metadataAccount = findMetadataPda(mint);
		const accountData = await connection.getAccountInfo(metadataAccount);

		const state = Metadata.deserialize(accountData!.data);

		const jsonUri = state[0].data.uri.slice(0, state[0].data.uri.indexOf('\x00'));

		const res = await (await fetch(jsonUri)).json();

		return {
			address: mint.toBase58(),
			symbol: res.symbol,
			name: res.name,
			logoURI: res.image
		};
	} catch {
		return null;
	}
};

const fetchTokenInfoFromSolanaProvider = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
	try {
		const tokenListProvider = new TokenListProvider();
		const tokenListContainer = await tokenListProvider.resolve();
		const tokenInfoList = tokenListContainer.getList();
		const res = tokenInfoList.find((c) => {
			return c.address === mint.toBase58();
		});

		return {
			address: res.address,
			symbol: res.symbol,
			name: res.name,
			logoURI: res.logoURI
		};
	} catch {
		return null;
	}
};

export const fetchTokenInfo = async (connection: Connection, mint: PublicKey): Promise<TokenInfo | undefined> => {
	const tokenInfoFromSolana = await fetchTokenInfoFromSolanaProvider(mint);
	if (tokenInfoFromSolana) return tokenInfoFromSolana;

	const tokenInfoFromMetaplex = await fetchTokenInfoFromMetaplex(connection, mint);
	return tokenInfoFromMetaplex;
};

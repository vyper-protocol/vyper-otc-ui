import { findMetadataPda } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { TokenListProvider } from '@solana/spl-token-registry';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getClusterEndpoint } from 'components/providers/OtcConnectionProvider';
import { TokenInfo } from 'models/TokenInfo';
import { NextApiRequest, NextApiResponse } from 'next';

type QueryObject = {
	type: 'address' | 'symbol',
	address?: string,
	symbol?: string
	mint?: PublicKey
}

function getQuery(req: NextApiRequest): QueryObject {
	if(req.query.mint) {
		const mint = new PublicKey(req.query.mint as string);
		const address = mint.toBase58();

		return {
			type: 'address',
			address: address,
			mint: mint
		};
	}
	if(req.query.symbol) {
		const symbol = req.query.symbol as string;
		return {
			type: 'symbol',
			symbol: symbol,
		};
	}
	return;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		res.status(404);
		return;
	}

	try {
		const query = getQuery(req);
		if(!query) return res.status(400).json({ err:'Invalid Query' });
		const cluster = process.env.NEXT_PUBLIC_CLUSTER;
		const connection = new Connection(getClusterEndpoint(cluster as Cluster));
		const tokenInfo = await fetchTokenInfo(connection, query);
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

const fetchTokenInfoFromSolanaProvider = async (query: QueryObject): Promise<TokenInfo | undefined> => {
	try {
		const tokenListProvider = new TokenListProvider();
		const tokenListContainer = await tokenListProvider.resolve();
		const tokenInfoList = tokenListContainer.getList();
		const res = tokenInfoList.find((c) => {
			return (c[query.type] === query[query.type]);
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

export const fetchTokenInfo = async (connection: Connection, query: QueryObject): Promise<TokenInfo | undefined> => {
	const tokenInfoFromSolana = await fetchTokenInfoFromSolanaProvider(query);
	if (tokenInfoFromSolana) return tokenInfoFromSolana;

	if(query.type === 'address') {
		const tokenInfoFromMetaplex = await fetchTokenInfoFromMetaplex(connection, query.mint);
		return tokenInfoFromMetaplex;
	}
	return null;
};

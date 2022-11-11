import { findMetadataPda } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { TokenListProvider } from '@solana/spl-token-registry';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TokenInfo } from 'models/TokenInfo';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		res.status(404);
		return;
	}

	try {
		const tokenInfo = await getTokenInfoFromRequest(req);
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

const fetchTokenInfoFromSolanaProviderUsingMint = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
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

const fetchTokenInfoFromSolanaProviderUsingSymbol = async (symbol: string): Promise<TokenInfo | undefined> => {
	try {
		const tokenListProvider = new TokenListProvider();
		const tokenListContainer = await tokenListProvider.resolve();
		const tokenInfoList = tokenListContainer.getList();
		const res = tokenInfoList.find((c) => {
			return c.symbol === symbol;
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

export const fetchTokenInfoUsingMint = async (connection: Connection, mint: PublicKey): Promise<TokenInfo | undefined> => {
	const tokenInfoFromSolana = await fetchTokenInfoFromSolanaProviderUsingMint(mint);
	if (tokenInfoFromSolana) return tokenInfoFromSolana;

	const tokenInfoFromMetaplex = await fetchTokenInfoFromMetaplex(connection, mint);
	return tokenInfoFromMetaplex;
};

export const fetchTokenInfoUsingSymbol = async (symbol: string): Promise<TokenInfo | undefined> => {
	const tokenInfoFromSolana = await fetchTokenInfoFromSolanaProviderUsingSymbol(symbol);
	return tokenInfoFromSolana;
};

const getTokenInfoFromRequest = async (req: NextApiRequest): Promise<TokenInfo | undefined> => {
	const connection = new Connection(clusterApiUrl(getCurrentCluster()));

	if (req.query.mint) {
		const mint = new PublicKey(req.query.mint as string);
		return await fetchTokenInfoUsingMint(connection, mint);
	}
	if (req.query.symbol) {
		const symbol = req.query.symbol as string;
		return await fetchTokenInfoUsingSymbol(symbol);
	}
	return;
};

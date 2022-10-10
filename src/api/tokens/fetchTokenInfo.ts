import { findMetadataPda } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { TokenListProvider } from '@solana/spl-token-registry';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenInfo } from 'models/TokenInfo';

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
	const tokenInfoFromMetaplex = await fetchTokenInfoFromMetaplex(connection, mint);
	if (tokenInfoFromMetaplex) return tokenInfoFromMetaplex;

	const tokenInfoFromSolana = await fetchTokenInfoFromSolanaProvider(mint);
	return tokenInfoFromSolana;
};

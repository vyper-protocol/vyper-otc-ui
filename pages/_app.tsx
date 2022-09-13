import 'styles/globals.css';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { FakeWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
	PhantomWalletAdapter,
	PhantomWalletAdapterConfig,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	SolletWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
	const network = WalletAdapterNetwork.Devnet;

	// You can also provide a custom RPC endpoint.
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	const wallets = useMemo(
		() => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SolletWalletAdapter()],
		[]
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ConnectionProvider endpoint={endpoint}>
				<WalletProvider wallets={wallets} autoConnect>
					<WalletModalProvider>
						<Component {...pageProps} />
					</WalletModalProvider>
				</WalletProvider>
			</ConnectionProvider>
		</QueryClientProvider>
	);
};

export default Application;

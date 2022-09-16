import 'styles/globals.css';
import { useMemo } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TxHandlerProvider } from 'providers/TxHandlerProvider';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	// You can also provide a custom RPC endpoint.
	const endpoint = RPC_ENDPOINTS.find((c) => c.cluster == 'devnet').endpoints[0];

	const wallets = useMemo(() => {
		return [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SolletWalletAdapter()];
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<ConnectionProvider endpoint={endpoint}>
				<WalletProvider wallets={wallets} autoConnect>
					<WalletModalProvider>
						<TxHandlerProvider>
							<Component {...pageProps} />
						</TxHandlerProvider>
					</WalletModalProvider>
				</WalletProvider>
			</ConnectionProvider>
		</QueryClientProvider>
	);
};

export default Application;

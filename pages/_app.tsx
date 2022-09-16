import 'styles/base.css';
import { useMemo } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { TxHandlerProvider } from 'providers/TxHandlerProvider';
import { QueryClient, QueryClientProvider } from 'react-query';

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	// You can also provide a custom RPC endpoint.
	const endpoint = RPC_ENDPOINTS.find((c) => {
		return c.cluster == 'devnet';
	}).endpoints[0];

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

import 'styles/base.css';
import { useMemo } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { TxHandlerProvider } from 'components/providers/TxHandlerProvider';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	// You can also provide a custom RPC endpoint.
	const endpoint = RPC_ENDPOINTS.find((c) => {
		return c.cluster === 'devnet';
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
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};

export default Application;

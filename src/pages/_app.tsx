/* eslint-disable indent */
/* eslint-disable prefer-const */
import 'styles/base.css';
import { useMemo } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { TxHandlerProvider } from 'components/providers/TxHandlerProvider';
import ApplicationError from 'components/templates/ApplicationError';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import Script from 'next/script';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { UrlProviderProvider } from 'components/providers/UrlClusterBuilderProvider';

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	const wallets = useMemo(() => {
		return [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SolletWalletAdapter()];
	}, []);

	return (
		<>
			<Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-Q7VRSL0DE3'}`} />
			<Script strategy="lazyOnload" id="ga-tracking-snippet">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-Q7VRSL0DE3'}');	
				`}
			</Script>
			<QueryClientProvider client={queryClient}>
				<UrlProviderProvider>
					<WalletProvider wallets={wallets}>
						<WalletModalProvider>
							<TxHandlerProvider>
								<ErrorBoundary FallbackComponent={ApplicationError}>
									<Component {...pageProps} />
								</ErrorBoundary>
							</TxHandlerProvider>
						</WalletModalProvider>
					</WalletProvider>
				</UrlProviderProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</>
	);
};

export default Application;

/* eslint-disable prefer-const */
import 'styles/base.css';
import { useEffect, useMemo, useState } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { TxHandlerProvider } from 'components/providers/TxHandlerProvider';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const Application = ({ Component, pageProps }) => {
	const router = useRouter();
	const initialCluster = RPC_ENDPOINTS.find((cluster) => {
		return cluster.cluster === 'devnet';
	});

	let { cluster } = router.query;

	const [routeWithParams, setRouteWithParams] = useState(initialCluster.cluster);
	const [endpoint, setEndpoint] = useState(initialCluster.endpoints[0]);

	useEffect(() => {
		const cleanParams = router.asPath.split('?');

		if ((cluster === undefined || cluster === 'undefined') && cleanParams[0].length === 1) {
			router.push(cleanParams[0].concat('?cluster=', routeWithParams));
		} else {
			setRouteWithParams(cluster as string);
		}
	}, []);

	useEffect(() => {
		if (cluster) {
			const newEndpoint = RPC_ENDPOINTS.find((c) => {
				return c.cluster === cluster;
			}).endpoints[0];

			setEndpoint(newEndpoint);
		}
	}, [cluster]);

	const wallets = useMemo(() => {
		return [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SolletWalletAdapter()];
	}, []);

	return (
		<>
			<Script strategy='lazyOnload' src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-Q7VRSL0DE3'}`} />
			<Script strategy='lazyOnload' id='ga-tracking-snippet'>
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-Q7VRSL0DE3'}');	
				`}
			</Script>
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
		</>
	);
};

export default Application;

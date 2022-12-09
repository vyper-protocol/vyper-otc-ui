/* eslint-disable indent */
/* eslint-disable prefer-const */
import 'styles/base.css';
import { useMemo } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LicenseInfo } from '@mui/x-license-pro';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-wallets';
import { OtcConnectionProvider } from 'components/providers/OtcConnectionProvider';
import { TxHandlerProvider } from 'components/providers/TxHandlerProvider';
import ApplicationError from 'components/templates/ApplicationError';
import Script from 'next/script';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { toast, ToastContainer } from 'react-toastify';

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_KEY);

// react-toastify css
require('react-toastify/dist/ReactToastify.min.css');

// Solana wallet adapter default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const queryClient = new QueryClient();

const theme = createTheme({
	typography: {
		fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif'
	}
});

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
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<QueryClientProvider client={queryClient}>
					<OtcConnectionProvider>
						<WalletProvider wallets={wallets}>
							<WalletModalProvider>
								<TxHandlerProvider>
									<ErrorBoundary FallbackComponent={ApplicationError}>
										<ThemeProvider theme={theme}>
											<Component {...pageProps} />
										</ThemeProvider>
									</ErrorBoundary>
								</TxHandlerProvider>
							</WalletModalProvider>
						</WalletProvider>
					</OtcConnectionProvider>
					<ToastContainer
						position={toast.POSITION.BOTTOM_RIGHT}
						autoClose={5000}
						hideProgressBar={false}
						theme="dark"
						newestOnTop={false}
						closeOnClick
						pauseOnHover
						pauseOnFocusLoss={false}
					/>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</LocalizationProvider>
		</>
	);
};

export default Application;

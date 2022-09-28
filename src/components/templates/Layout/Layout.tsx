import { ReactNode } from 'react';

import TopBar from 'components/organisms/TopBar/TopBar';
import { Pane } from 'evergreen-ui';
import Head from 'next/head';

import Footer from '../Footer/Footer';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	return (
		<Pane>
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Pane>
				<TopBar />

				<main>{children}</main>

				<Footer />
			</Pane>
		</Pane>
	);
};

export default Layout;

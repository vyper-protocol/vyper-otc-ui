import { ReactNode } from 'react';

import TopBar from 'components/organisms/TopBar/TopBar';
import Head from 'next/head';

import Footer from '../Footer/Footer';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	return (
		<div>
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<TopBar />

			<main>{children}</main>

			<Footer />
		</div>
	);
};

export default Layout;

import { ReactNode } from 'react';

import TopBar from 'components/organisms/TopBar/TopBar';
import { Pane } from 'evergreen-ui';
import Head from 'next/head';

import Footer from '../Footer/Footer';
import styles from './Layout.module.scss';

type LayoutProps = {
	children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
	return (
		<Pane backgroundColor="#f3f5f6">
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={styles.main}>
				<TopBar />
				<main>{children}</main>
				<Footer />
			</div>
		</Pane>
	);
};

export default Layout;

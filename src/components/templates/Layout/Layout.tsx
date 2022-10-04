import { ReactNode } from 'react';

import TopBar, { TopBarProps } from 'components/organisms/TopBar';
import { Pane } from 'evergreen-ui';
import Head from 'next/head';

import Footer from '../Footer';
import styles from './Layout.module.scss';

type LayoutProps = {
	children: ReactNode;
	topBarProps?: TopBarProps;
};

const Layout = ({ children, topBarProps }: LayoutProps) => {
	return (
		<Pane>
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Pane>
				<TopBar {...topBarProps} />

				<main className={styles.main}>{children}</main>

				<Footer />
			</Pane>
		</Pane>
	);
};

export default Layout;

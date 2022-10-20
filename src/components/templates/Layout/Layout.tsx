import { ReactNode, useState } from 'react';

import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
import { Pane } from 'evergreen-ui';
import Head from 'next/head';
import Image, { StaticImageData } from 'next/image';

import Footer from '../Footer';
import styles from './Layout.module.scss';

type LayoutProps = {
	children: ReactNode;
	withSearch?: boolean;
	withBackgroundImage?: StaticImageData;
};

const Layout = ({ children, withSearch, withBackgroundImage }: LayoutProps) => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<Pane>
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
				{/* Resets body background color for all the routes */}
				<style>{'body { background-color: var(--color-background); }'}</style>
			</Head>

			<Pane>
				<TopBar />
				{withSearch && <SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />}
				{withBackgroundImage && <Image alt="abstract-colors" src={withBackgroundImage} layout="fill" objectFit="cover" quality={50} priority />}
				<main className={styles.main}>{children}</main>
				<Footer />
			</Pane>
		</Pane>
	);
};

export default Layout;

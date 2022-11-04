import { ReactNode, useState } from 'react';

import { Box } from '@mui/material';
import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
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
		<Box>
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
				{/* Resets body background color for all the routes */}
				<style>{'body { background-color: var(--color-background); }'}</style>
			</Head>

			<div className={styles.layout}>
				<TopBar />
				{withSearch && <SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />}
				{withBackgroundImage && (
					<Image alt="abstract-colors" src={withBackgroundImage} layout="fill" objectFit="cover" quality={50} priority className={styles.background} />
				)}
				<main className={styles.main}>{children}</main>
				<Footer />
			</div>
		</Box>
	);
};

export default Layout;

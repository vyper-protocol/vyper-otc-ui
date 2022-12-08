import { ReactNode, useState } from 'react';

import { Box } from '@mui/material';
import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Image, { StaticImageData } from 'next/image';
import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_PAGE_TITLE } from 'utils/constants';

import Footer from '../Footer';
import styles from './Layout.module.scss';

type LayoutProps = {
	pageTitle?: string;
	pageDescription?: string;
	children: ReactNode;
	withSearch?: boolean;
	withBackgroundImage?: StaticImageData;
};

const Layout = ({ pageTitle, pageDescription, children, withSearch, withBackgroundImage }: LayoutProps) => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<Box>
			<Head>
				{/* <title>{pageTitle ?? DEFAULT_PAGE_TITLE}</title>
				<meta name="description" content={pageDescription ?? DEFAULT_PAGE_DESCRIPTION}></meta> */}

				<link rel="icon" href="/favicon.ico" />

				{/* Resets body background color for all the routes */}
				<style>{'body { background-color: var(--color-background); }'}</style>
			</Head>

			<div className={styles.layout}>
				<NextSeo
					title={pageTitle}
					titleTemplate={'%s | ' + DEFAULT_PAGE_TITLE}
					defaultTitle={DEFAULT_PAGE_TITLE}
					description={pageDescription ?? DEFAULT_PAGE_DESCRIPTION}
					openGraph={{
						title: pageTitle ?? DEFAULT_PAGE_TITLE,
						description: pageDescription ?? DEFAULT_PAGE_DESCRIPTION,
						images: [{ url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/assets/images/vyper-logo_512.png` }],
						siteName: DEFAULT_PAGE_TITLE
					}}
					twitter={{
						handle: '@VyperProtocol',
						site: '@VyperProtocol',
						cardType: 'summary_large_image'
					}}
					themeColor="#008891"
				/>

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

import { useState } from 'react';

import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
import Footer from 'components/templates/Footer';
import { Pane } from 'evergreen-ui';
import Image from 'next/image';

import styles from './index.module.scss';

const Home = () => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<Pane className="root">
			<div className={styles.bg_wrapper}>
				<TopBar />
				<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
				<Image alt="abstract-colors" src="/background.jpg" layout="fill" objectFit="cover" quality={100} style={{ zIndex: -1 }} />
			</div>
			<div className={styles.text_wrapper}>
				<h2>VYPER OTC</h2>
				<p className={styles.text}>The Derivatives Solana Platform</p>
			</div>
			<Footer />
		</Pane>
	);
};

export default Home;

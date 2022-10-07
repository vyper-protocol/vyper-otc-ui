import { useState } from 'react';

import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
import Footer from 'components/templates/Footer';
import Image from 'next/image';

import backgroundImage from '../../public/background.webp';
import styles from './index.module.scss';

const Home = () => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<>
			<div className={styles.bg_wrapper}>
				<TopBar />
				<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
				<Image alt="abstract-colors" src={backgroundImage} layout="fill" objectFit="cover" quality={50} priority />
			</div>
			<div className={styles.text_wrapper}>
				<h2>VYPER OTC</h2>
				<p className={styles.text}>The Derivatives Solana Platform</p>
			</div>
			<Footer />
		</>
	);
};

export default Home;

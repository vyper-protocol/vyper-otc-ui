import { useState } from 'react';

import SearchBar from 'components/molecules/SearchBar';
import Header from 'components/templates/Header';
import Layout from 'components/templates/Layout';

import styles from './index.module.scss';

const Home = () => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<Layout>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />

			<Header title="Welcome to the best derivatives platform!" />
		</Layout>
	);
};

export default Home;

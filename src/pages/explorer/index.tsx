/* eslint-disable space-before-function-paren */
import { useState } from 'react';

import SearchBar from 'components/molecules/SearchBar';
import Layout from 'components/templates/Layout';

import styles from './explorer.module.scss';

const ExplorerPage = () => {
	const [searchValue, setSearchValue] = useState('');

	return (
		<Layout>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
		</Layout>
	);
};

export default ExplorerPage;

/* eslint-disable space-before-function-paren */
import { useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import SearchBar from 'components/molecules/SearchBar';
import Layout from 'components/templates/Layout';
import fetchContracts from 'controllers/fetchContracts';
import { ChainOtcState } from 'models/ChainOtcState';

import styles from './explorer.module.scss';
import { Button } from 'evergreen-ui';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';

const ExplorerPage = () => {
	const [searchValue, setSearchValue] = useState('');
	const { connection } = useConnection();

	const [contracts, setContracts] = useState<ChainOtcState[]>([]);
	const onFetchButtonClick = async () => {
		const res = await fetchContracts(connection, FetchContractsParams.buildNotExpiredContractsQuery());

		setContracts(res);
	};

	return (
		<Layout>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
			<Button onClick={onFetchButtonClick}>Fetch contracts</Button>
			<ul>
				{contracts.map((c) => (
					<li key={c.publickey.toBase58()}>{c.publickey.toBase58()}</li>
				))}
			</ul>
		</Layout>
	);
};

export default ExplorerPage;

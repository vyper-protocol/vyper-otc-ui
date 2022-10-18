import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import SearchBar from 'components/molecules/SearchBar';
import ExplorerContractDataGrid from 'components/organisms/ExplorerContractDataGrid';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import fetchContracts from 'controllers/fetchContracts';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { Spinner } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';

import styles from './explorer.module.scss';

const ExplorerPage = () => {
	const [searchValue, setSearchValue] = useState('');
	const { connection } = useConnection();

	const [contractsLoading, setContractsLoading] = useState(false);
	const [contracts, setContracts] = useState<ChainOtcState[]>([]);

	useEffect(() => {
		setContractsLoading(true);
		setContracts([]);
		fetchContracts(connection, FetchContractsParams.buildNotExpiredContractsQuery(getCurrentCluster()))
			.then((c) => setContracts(c))
			.finally(() => setContractsLoading(false));
	}, [connection]);

	return (
		<Layout>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />

			{contractsLoading && <Spinner />}

			{contracts.length > 0 && <ExplorerContractDataGrid contracts={contracts} />}
		</Layout>
	);
};

export default ExplorerPage;

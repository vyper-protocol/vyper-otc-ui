import { useContext, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import SearchBar from 'components/molecules/SearchBar';
import ExplorerContractCard from 'components/organisms/ExplorerContractCard';
import ExplorerContractDataGrid from 'components/organisms/ExplorerContractDataGrid';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import Layout from 'components/templates/Layout';
import fetchContracts from 'controllers/fetchContracts';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { Pane, Spinner } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { useRouter } from 'next/router';

import styles from './explorer.module.scss';

const ExplorerPage = () => {
	const [searchValue, setSearchValue] = useState('');
	const { connection } = useConnection();
	const urlProvider = useContext(UrlProviderContext);
	const router = useRouter();

	const [contractsLoading, setContractsLoading] = useState(false);
	const [contracts, setContracts] = useState<ChainOtcState[]>([]);

	useEffect(() => {
		setContractsLoading(true);
		setContracts([]);
		fetchContracts(connection, FetchContractsParams.buildNotExpiredContractsQuery())
			.then((c) => setContracts(c))
			.finally(() => setContractsLoading(false));
	}, [connection]);

	const onCardClick = (pubkey: string) => {
		router.push(urlProvider.buildContractSummaryUrl(pubkey));
	};

	return (
		<Layout>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />

			{contractsLoading && <Spinner />}

			{contracts.length > 0 && <ExplorerContractDataGrid contracts={contracts} />}

			<Pane margin={20}>
				<Grid container spacing={2}>
					{contracts.map((c) => (
						<Grid key={c.publickey.toBase58()} item xs={4}>
							<ExplorerContractCard otcState={c} onClick={() => onCardClick(c.publickey.toBase58())} />
						</Grid>
					))}
				</Grid>
			</Pane>
		</Layout>
	);
};

export default ExplorerPage;

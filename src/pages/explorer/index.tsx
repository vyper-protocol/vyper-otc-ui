import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import ExplorerContractDataGrid from 'components/organisms/ExplorerContractDataGrid';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import fetchContracts from 'controllers/fetchContracts';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { Spinner } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';

const ExplorerPage = () => {
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
		<Layout withSearch>
			{contractsLoading && <Spinner />}

			{contracts.length > 0 && <ExplorerContractDataGrid contracts={contracts} />}
		</Layout>
	);
};

export default ExplorerPage;

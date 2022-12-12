/* eslint-disable space-before-function-paren */

import { useEffect, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import ChainOtcStateDetails from 'components/ChainOtcStateDetails/ChainOtcStateDetails';
import Layout from 'components/templates/Layout';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';

import styles from './summary.module.scss';

const SummaryPageId = () => {
	const router = useRouter();
	const { connection } = useConnection();

	const { id } = router.query;

	// Pass the cluster option as a unique indetifier to the query
	const rateStateQuery = useGetFetchOTCStateQuery(connection, id as string);

	const [pageTitle, setPageTitle] = useState('');
	useEffect(() => {
		if (rateStateQuery.data) setPageTitle(`${rateStateQuery.data.chainData.getContractTitle()} ${rateStateQuery.data.aliasId.toUpperCase()}`);
	}, [rateStateQuery.data]);

	const loadingSpinner = rateStateQuery?.isLoading;
	const errorMessage = rateStateQuery?.isError;
	const showContent = rateStateQuery?.isSuccess;

	return (
		<Layout withSearch pageTitle={pageTitle}>
			<Box className={styles.container}>
				{errorMessage && <p>Contract not found</p>}

				{loadingSpinner && <CircularProgress />}

				{showContent && !errorMessage && !loadingSpinner && rateStateQuery?.data && (
					<ChainOtcStateDetails
						otcState={rateStateQuery?.data}
						isFetching={rateStateQuery.isFetching}
						onRefetchClick={() => {
							rateStateQuery.refetch();
						}}
					/>
				)}
			</Box>
		</Layout>
	);
};

export default SummaryPageId;

import { Box, CircularProgress } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';

import ChainOtcStateDetails from '../ChainOtcStateDetails/ChainOtcStateDetails';
import styles from './OtcContractContainer.module.scss';

export type OtcContractContainerInput = {
	pubkey: string;
};

const OtcContractContainer = ({ pubkey }: OtcContractContainerInput) => {
	const { connection } = useConnection();

	// Pass the cluster option as a unique indetifier to the query
	const rateStateQuery = useGetFetchOTCStateQuery(connection, pubkey);

	const loadingSpinner = rateStateQuery?.isLoading;
	const errorMessage = rateStateQuery?.isError;
	const showContent = rateStateQuery?.isSuccess;

	return (
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
	);
};

export default OtcContractContainer;

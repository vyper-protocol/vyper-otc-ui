/* eslint-disable space-before-function-paren */

import { useConnection } from '@solana/wallet-adapter-react';
import ChainOtcStateDetails from 'components/organisms/ChainOtcStateDetails/ChainOtcStateDetails';
import Layout from 'components/templates/Layout';
import { Pane } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';

const SummaryPageId = () => {
	const router = useRouter();
	const { connection } = useConnection();

	const { id } = router.query;

	// Pass the cluster option as a unique indetifier to the query
	const rateStateQuery = useGetFetchOTCStateQuery(connection, id as string);

	const loadingSpinner = rateStateQuery?.isLoading;
	const errorMessage = rateStateQuery?.isError;
	const showContent = rateStateQuery?.isSuccess;

	return (
		<Layout withSearch>
			<Pane clearfix margin={24} maxWidth={620}>
				{errorMessage && <p>Contract not found</p>}

				{loadingSpinner && <Spinner />}

				{showContent && !errorMessage && !loadingSpinner && rateStateQuery?.data && <ChainOtcStateDetails otcState={rateStateQuery?.data} />}
			</Pane>
		</Layout>
	);
};

export default SummaryPageId;

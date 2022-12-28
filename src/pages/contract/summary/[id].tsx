/* eslint-disable space-before-function-paren */

import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import OtcContractContainer from 'components/OtcContractContainer';
import Layout from 'components/templates/Layout';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';

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

	return (
		<Layout withSearch pageTitle={pageTitle}>
			<OtcContractContainer pubkey={id as string} />
		</Layout>
	);
};

export default SummaryPageId;

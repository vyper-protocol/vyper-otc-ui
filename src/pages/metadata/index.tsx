import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import { useEffect } from 'react';
import { loadEnvConfig } from '@next/env';

const MetadataPage = () => {
	const { connection } = useConnection();
	const metadataEntries = [
		{ label: 'NODE_ENV', value: process.env.NODE_ENV },
		{ label: 'cluster', value: getCurrentCluster() },
		{ label: 'rpcEndpoint', value: connection.rpcEndpoint },
		{ label: 'connection commitment', value: connection.commitment },

		// * *
		{ label: 'NETLIFY BUILD_ID', value: process.env.BUILD_ID },
		{ label: 'NETLIFY CONTEXT', value: process.env.CONTEXT },

		// * *
		{ label: 'NETLIFY GIT REPOSITORY_URL', value: process.env.REPOSITORY_URL },
		{ label: 'NETLIFY GIT BRANCH', value: process.env.BRANCH },
		{ label: 'NETLIFY GIT HEAD', value: process.env.HEAD },
		{ label: 'NETLIFY GIT COMMIT_REF', value: process.env.COMMIT_REF },

		// * *
		{ label: 'NETLIFY URL', value: process.env.URL },
		{ label: 'NETLIFY DEPLOY_URL', value: process.env.DEPLOY_URL },
		{ label: 'NETLIFY DEPLOY_PRIME_URL', value: process.env.DEPLOY_PRIME_URL },
		{ label: 'NETLIFY SITE_NAME', value: process.env.SITE_NAME },
		{ label: 'NETLIFY DEPLOY_ID', value: process.env.DEPLOY_ID }
	];

	return (
		<Layout>
			<TableContainer component={Paper} sx={{ width: '80%' }}>
				<Table>
					<TableBody>
						{metadataEntries.map((c) => (
							<TableRow key={c.label} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component="th" scope="row">
									{c.label}
								</TableCell>
								<TableCell align="right">{c.value}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Layout>
	);
};

export default MetadataPage;

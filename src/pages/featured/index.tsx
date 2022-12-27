/* eslint-disable no-console */
import { Box, Link } from '@mui/material';
import SponsoredGrid from 'components/SponsoredGrid/SponsoredGrid';
import Layout from 'components/templates/Layout';

import styles from './index.module.scss';

const SponsoredPage = () => {
	return (
		<Layout>
			<Box className={styles.container}>
				<h2>Featured Products</h2>
				<h4>
					A selection of our most requested trading products, all built using our <Link href="/contract/create">Vyper derivatives engine</Link>{' '}
				</h4>
				<div>
					<SponsoredGrid></SponsoredGrid>
				</div>
			</Box>
		</Layout>
	);
};

export default SponsoredPage;

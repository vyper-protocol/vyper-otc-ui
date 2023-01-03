import { Box } from '@mui/material';
import SponsoredGrid from 'components/SponsoredGrid/SponsoredGrid';
import Layout from 'components/templates/Layout';

import styles from './index.module.scss';

const SponsoredPage = () => {
	return (
		<Layout>
			<Box sx={{ display: 'flex' }} className={styles.container}>
				<h2>Featured Products</h2>
				<SponsoredGrid />
			</Box>
		</Layout>
	);
};

export default SponsoredPage;

import { Box } from '@mui/material';
import SponsoredGrid from 'components/SponsoredGrid/SponsoredGrid';
import Layout from 'components/templates/Layout';

import styles from './index.module.scss';

const SponsoredPage = () => {
	return (
		<Layout>
			<Box className={styles.container}>
				<h2>Featured Products</h2>

				<div className={styles.container}>
					<SponsoredGrid />
				</div>
			</Box>
		</Layout>
	);
};

export default SponsoredPage;

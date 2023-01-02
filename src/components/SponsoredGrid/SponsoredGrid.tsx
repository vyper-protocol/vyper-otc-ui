import { Box } from '@mui/material';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import SponsoredThumbnail from 'components/SponsoredThumbnail';
import { TemplateCardProps } from 'components/SponsoredThumbnail';
import featured from 'configs/featured.json';

import styles from './SponsoredGrid.module.scss';

const createYourOwn = {
	ticker: 'NEW CONTRACT',
	title: 'Create your own derivative',
	description: 'Use our engine to create a new fully customizable derivative.',
	tags: ['bespoke', 'any'],
	imgSrc: '/create-logo.png',
	isActive: true,
	id: '/contract/create'
};

const SponsoredGrid = () => {
	const sponsoredList = featured.featured as TemplateCardProps[];
	const currentCluster = getCurrentCluster();
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
			<Box className={styles.glow}>
				<SponsoredThumbnail {...createYourOwn} />
			</Box>
			{sponsoredList
				.filter(({ isActive, clusters }) => !isActive || clusters?.includes(currentCluster))
				.map((v, i) => (
					<SponsoredThumbnail key={i} {...v} />
				))}
		</Box>
	);
};

export default SponsoredGrid;

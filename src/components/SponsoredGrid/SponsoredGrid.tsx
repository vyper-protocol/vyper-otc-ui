import { Grid } from '@mui/material';
import SponsoredThumbnail from 'components/SponsoredThumbnail';
import { TemplateCardProps } from 'components/SponsoredThumbnail';
import featuredData from 'configs/featured-products.json';

import styles from './SponsoredGrid.module.scss';

const SponsoredGrid = () => {
	const sponsoredList = featuredData.sponsored as TemplateCardProps[];

	const createYourOwn = {
		ticker: 'NEW CONTRACT',
		title: 'Create your own derivative',
		description: 'Use our engine to create a new fully customizable derivative.',
		chipOne: 'BESPOKE',
		chipTwo: 'ANY',
		imgSrc: '/create-logo.png',
		isActive: true,
		linkUrl: '/contract/create'
	};

	return (
		<div>
			<Grid container spacing={1} display="flex" justifyContent="center">
				{sponsoredList.map((v, i) => (
					<Grid item xs="auto" key={i}>
						<SponsoredThumbnail key={i} {...v}></SponsoredThumbnail>
					</Grid>
				))}
				<Grid item xs="auto" className={styles.glow}>
					<SponsoredThumbnail {...createYourOwn}></SponsoredThumbnail>
				</Grid>
			</Grid>
		</div>
	);
};

export default SponsoredGrid;

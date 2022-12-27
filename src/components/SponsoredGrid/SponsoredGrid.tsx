import { Grid } from '@mui/material';
import SponsoredThumbnail from 'components/SponsoredThumbnail';
import { TemplateCardProps } from 'components/SponsoredThumbnail';
import featuredData from 'configs/featured-products.json';

const SponsoredGrid = () => {
	const sponsoredList = featuredData.sponsored as TemplateCardProps[];

	return (
		<div>
			<Grid container spacing={2}>
				{sponsoredList.map((v, i) => (
					<Grid item xs={12} sm={6} md={4} lg={3} key={i}>
						<SponsoredThumbnail key={i} {...v}></SponsoredThumbnail>
					</Grid>
				))}
			</Grid>
		</div>
	);
};

export default SponsoredGrid;

import { Box } from '@mui/material';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import SponsoredThumbnail from 'components/SponsoredThumbnail';
import { TemplateCardProps } from 'components/SponsoredThumbnail';
import featured from 'configs/featured.json';
import { buildCreateContractUrl, buildFeaturedContractUrl } from 'utils/urlBuilder';

import styles from './SponsoredGrid.module.scss';

const createYourOwn = {
	ticker: 'NEW CONTRACT',
	title: 'Create your own derivative',
	description: 'Use our engine to create a new fully customizable derivative.',
	tags: ['bespoke', 'any'],
	imgSrc: '/create-logo.png',
	isActive: true
};

const isFullUrl = (s: string) => {
	const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return regexp.test(s);
};

const SponsoredGrid = () => {
	const sponsoredList = featured.featured as TemplateCardProps[];
	const currentCluster = getCurrentCluster();
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
			<Box className={styles.glow}>
				<SponsoredThumbnail {...createYourOwn} id={buildCreateContractUrl()} />
			</Box>
			{sponsoredList
				.filter(({ isActive, clusters }) => !isActive || clusters?.includes(currentCluster))
				.map(({ ticker, title, description, tags, imgSrc, isActive, id }, i) => (
					<SponsoredThumbnail
						key={i}
						id={isFullUrl(id) ? id : buildFeaturedContractUrl(id)}
						ticker={ticker}
						title={title}
						description={description}
						tags={tags}
						imgSrc={imgSrc}
						isActive={isActive}
					/>
				))}
		</Box>
	);
};

export default SponsoredGrid;

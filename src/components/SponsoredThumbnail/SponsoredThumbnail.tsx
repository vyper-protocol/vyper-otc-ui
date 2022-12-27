/* eslint-disable no-console */
import { Box, Card, Chip, Grid } from '@mui/material';
import cn from 'classnames';

import styles from './SponsoredThumbnail.module.scss';

export type TemplateCardProps = {
	linkUrl: string;
	imgSrc: string;
	ticker: string;
	title: string;
	description: string;
	chipOne: string;
	chipTwo: string;
	isActive: boolean;
};

const SponsoredThumbnail = ({ linkUrl, imgSrc, ticker, title, description, chipOne, chipTwo, isActive }: TemplateCardProps) => {
	return (
		<a href={linkUrl} target="_blank" rel="noreferrer">
			<div className={styles.sponsored_div}>
				<Card className={isActive ? styles.sponsored_card : cn(styles.sponsored_card, styles.sponsored_card_inactive)}>
					<Grid container justifyContent="center">
						<Box component="img" src={imgSrc} alt="logo" className={styles.card_image} />
					</Grid>
					<Box sx={{ width: '32px', height: '16px' }}></Box>
					<Card className={styles.card_box} sx={{ '&:hover': { boxShadow: 3 } }}>
						<div className={styles.card_header}>
							<h6>{ticker}</h6>
						</div>
						<Box sx={{ width: '16px', height: '8px' }}></Box>
						<div className={styles.card_title}>
							<h6>{title}</h6>
						</div>
						<Box sx={{ width: '8px', height: '8px' }}></Box>
						<div>{description}</div>
						<Box sx={{ width: '32px', height: '16px' }}></Box>
						<div>
							<Chip label={chipOne} color="primary" sx={{ marginRight: '8px' }}></Chip>
							<Chip label={chipTwo} color="secondary"></Chip>
						</div>
					</Card>
				</Card>
			</div>
		</a>
	);
};

export default SponsoredThumbnail;

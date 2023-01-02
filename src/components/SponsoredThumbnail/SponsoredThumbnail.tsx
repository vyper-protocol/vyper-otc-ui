/* eslint-disable no-console */
import { Box, Card, Chip, Grid } from '@mui/material';
import { Cluster } from '@solana/web3.js';
import cn from 'classnames';
import StatusBadge from 'components/StatusBadge';
import { buildFeaturedContractUrl } from 'utils/urlBuilder';

import styles from './SponsoredThumbnail.module.scss';
buildFeaturedContractUrl;

export type SponsoredThumbnailProps = {
	ticker: string;
	title: string;
	description: string;
	tags: string[];
	clusters?: Cluster[];
	imgSrc: string;
	isActive: boolean;
	id?: string;
	pubkey?: string;
	icon?: string;
};

const SponsoredThumbnail = ({ ticker, title, description, tags, imgSrc, isActive, id }: SponsoredThumbnailProps) => {
	return (
		<a href={buildFeaturedContractUrl(id)} target="_blank" rel="noreferrer">
			<div className={styles.sponsored_div}>
				<Card className={isActive ? styles.sponsored_card : cn(styles.sponsored_card, styles.sponsored_card_inactive)}>
					<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						<Box component="img" src={imgSrc} alt="logo" className={styles.card_image} />
					</Box>

					<Box className={styles.card_box} sx={{ mt: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
						<Box className={styles.card_header}>
							<h5>{ticker}</h5>
						</Box>
						<div>
							<Box sx={{ display: 'flex', flexDirection: 'column' }} className={styles.card_title}>
								<h6>{title}</h6>
							</Box>
							<div>{description}</div>
						</div>

						<Box sx={{ display: 'flex' }}>
							{tags.map((label, i) => (
								<StatusBadge key={i} label={label} mode={i === 0 ? 'info' : 'dark'} />
							))}
						</Box>
					</Box>
				</Card>
			</div>
		</a>
	);
};

export default SponsoredThumbnail;

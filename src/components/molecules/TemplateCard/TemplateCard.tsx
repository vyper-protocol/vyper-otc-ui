import { Box, Skeleton } from '@mui/material';
import cn from 'classnames';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

import styles from './TemplateCard.module.scss';

// TODO: accept a contract template object
export type TemplateCardProps = {
	payoff: RLPluginTypeIds;
	type?: 'call' | 'put';
	// TODO: add expiry pillars as type?
	expiry: string;
	underlying: string;
	imgPath: string;
	rateId: RatePluginTypeIds;
	// TODO: load from oracles.json
	pubkey: string;
};
export const TemplateCard = ({ payoff, type, expiry, underlying, imgPath, rateId, pubkey }: TemplateCardProps) => {
	const { pricesValue, isInitialized } = useOracleLivePrice(rateId, [pubkey]);

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<div className={styles.badgeContainer}>
					<div className={cn(styles.badge, styles.expiry)}>{expiry}</div>
					<div className={cn(styles.badge, styles.payoff)}>{payoff}</div>
					{type && <div className={cn(styles.badge, styles.type)}>{type}</div>}
				</div>
				<div className={styles.logoContainer}>
					<Box className={styles.logo} component="img" src={imgPath} />
				</div>
				<div className={styles.infoContainer}>
					<div>
						<div className={styles.symbol}>{underlying}</div>
						{/* TODO: use OracleLivePrice */}
						{!isInitialized ? (
							<Skeleton variant="rectangular" width={80} height={20} animation="wave" />
						) : (
							<div className={styles.price}>${formatWithDecimalDigits(pricesValue[0], 6)}</div>
						)}
					</div>
					{/* TODO: add strike? */}
				</div>
			</div>
		</div>
	);
};

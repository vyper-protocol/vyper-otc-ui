import { Box, Skeleton } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { getPriceForStrike } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { RateTypeIds, PayoffTypeIds } from 'models/common';
import moment from 'moment';
import { useRouter } from 'next/router';
import useContractStore from 'store/useContractStore';
import { getLastFridayOfMonth, getLastFridayOfQuarter, getNextDay, getNextFriday, getNextHour, getTomNextDay } from 'utils/momentHelpers';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOraclesByTitle } from 'utils/oracleDatasetHelper';

import styles from './TemplateCard.module.scss';

type ExpiryType = 'hourly' | 'daily' | 'dailyNext' | 'weekly' | 'monthly' | 'quarterly';
function convertExpiry(expiry: ExpiryType): number {
	// at the 30th minute go to next hourly slot
	const minuteCutoff = 30;

	// 9 AM UTC expiries
	const utcHour = 9;

	switch (expiry) {
		case 'hourly':
			return getNextHour(minuteCutoff).toDate().getTime();
		case 'daily':
			return getNextDay(utcHour).toDate().getTime();
		case 'dailyNext':
			return getTomNextDay(utcHour).toDate().getTime();
		case 'weekly':
			return getNextFriday(utcHour).toDate().getTime();
		case 'monthly':
			return getLastFridayOfMonth(utcHour).toDate().getTime();
		case 'quarterly':
			return getLastFridayOfQuarter(utcHour).toDate().getTime();
		default:
			break;
	}
}

// TODO: accept a contract template object
export type TemplateCardProps = {
	description?: string;
	reserveMint: string;
	buyerDepositAmount: number;
	sellerDepositAmount: number;
	payoff: PayoffTypeIds;
	payoffData: any;
	expiry: ExpiryType;
	rateId: RateTypeIds;
	underlying: string;
	imgPath: string;
};

function createCompletePayoffData(payoffData: any): { notional: number; isLinear: boolean; isStandard: boolean; isCall: boolean } {
	return {
		notional: 1,
		isCall: true,
		isLinear: true,
		isStandard: true,
		...payoffData
	};
}

export const TemplateCard = ({
	description,
	reserveMint,
	buyerDepositAmount,
	sellerDepositAmount,
	payoff,
	payoffData,
	expiry,
	rateId,
	underlying,
	imgPath
}: TemplateCardProps) => {
	const { pricesValue, isInitialized } = useOracleLivePrice(rateId, [getOraclesByTitle(underlying, rateId).pubkey]);
	const { connection } = useConnection();

	const router = useRouter();
	const { create } = useContractStore();

	const onCardClick = async () => {
		const price = await getPriceForStrike(rateId, [getOraclesByTitle(underlying, rateId).pubkey], connection, getCurrentCluster());

		create({
			reserveMint: reserveMint,
			seniorDepositAmount: buyerDepositAmount,
			juniorDepositAmount: sellerDepositAmount,
			depositStart: moment().add(-60, 'minutes').toDate().getTime(),
			depositEnd: moment().add(15, 'minutes').toDate().getTime(),
			settleStart: convertExpiry(expiry),
			redeemLogicOption: {
				redeemLogicPluginType: payoff,
				...createCompletePayoffData(payoffData),
				strike: price
			},
			rateOption: {
				ratePluginType: rateId,
				rateAccounts: [getOraclesByTitle(underlying, rateId).pubkey]
			},
			saveOnDatabase: true,
			sendNotification: true
		});
		router.push('/contract/create');
	};

	return (
		<div className={styles.container} onClick={onCardClick}>
			<div className={styles.card}>
				<div className={styles.badgeContainer}>
					<div className={cn(styles.badge, styles.expiry)}>{expiry}</div>
					<div className={cn(styles.badge, styles.payoff)}>{payoff}</div>
					{description && <div className={cn(styles.badge, styles.type)}>{description}</div>}
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

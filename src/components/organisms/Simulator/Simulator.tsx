import { useState } from 'react';

import { TextField } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import NumericBadge from 'components/atoms/NumericBadge';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

import styles from './Simulator.module.scss';

type SimulatorProps = {} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ className, ref }: SimulatorProps) => {
	const router = useRouter();
	const { connection } = useConnection();
	const [prices, setPrices] = useState<number[]>(Array(10).fill(0));

	const { id } = router.query;

	const rateStateQuery = useGetFetchOTCStateQuery(connection, id as string);
	const tokenSymbol = rateStateQuery?.data?.reserveTokenInfo?.symbol ?? '';

	const buyerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicAccount?.state.getPnl(prices, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[0],
		4
	);
	const sellerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicAccount?.state.getPnl(prices, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[1],
		4
	);

	const handleOnPriceChange = (newValue: string, i: number) => {
		const pricesValueClone = _.clone(prices);
		pricesValueClone[i] = parseInt(newValue);
		setPrices(pricesValueClone);
	};

	return (
		<div className={cn(styles.wrapper, className)} ref={ref}>
			<p className={styles.title}>Simulate your PnL</p>
			{rateStateQuery?.data.redeemLogicAccount.state.settlementPricesDescription.map((c, i) => (
				<div key={i} className={cn(styles.flex, styles.margin)}>
					<p>{c}:</p>
					<TextField type="number" size="small" sx={{ width: '70%' }} value={prices[i]} onChange={(e) => handleOnPriceChange(e.target.value, i)} />
				</div>
			))}

			<div className={styles.margin}>
				{rateStateQuery?.data?.redeemLogicAccount.state.pluginDetails.map((detail, index) => (
					<div key={detail.label} className={cn(styles.flex, index % 2 && styles.row)}>
						<p className={styles.bold}>{detail.label}</p>
						<p className={styles.bold}>{typeof detail.value === 'number' ? formatWithDecimalDigits(detail.value) : detail.value}</p>
					</div>
				))}
			</div>

			<div className={cn(styles.flex, styles.margin)}>
				<div className={styles.center}>
					Long
					<br />
					<NumericBadge label={buyerPnl + ' ' + tokenSymbol} mode={buyerPnl > 0 ? 'success' : 'error'} />
				</div>
				<div className={styles.center}>
					Short
					<br />
					<NumericBadge label={sellerPnl + ' ' + tokenSymbol} mode={sellerPnl > 0 ? 'success' : 'error'} />
				</div>
			</div>

			<p className={styles.note}>
				This is the simulated PnL if{' '}
				{rateStateQuery?.data.redeemLogicAccount.state.settlementPricesDescription.map((c, i) => (
					<span key={i}>
						{c.toLowerCase()} gets to {prices[i]}
						{i === rateStateQuery?.data.redeemLogicAccount.state.settlementPricesDescription.length - 1 ? '' : ', '}
					</span>
				))}
			</p>
		</div>
	);
};

export default Simulator;

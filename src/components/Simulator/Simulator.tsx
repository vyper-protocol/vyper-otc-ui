import { useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import NumericBadge from 'components/NumericBadge';
import NumericField from 'components/NumericField';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

import styles from './Simulator.module.scss';

type SimulatorProps = {
	chainData: ChainOtcState;
} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ chainData, className, ref }: SimulatorProps) => {
	const [prices, setPrices] = useState<number[]>(Array(10).fill(0));

	const tokenSymbol = chainData.collateralTokenInfo?.symbol ?? '';

	const longPnl = formatWithDecimalDigits(
		chainData.redeemLogicAccount?.state.getPnl(prices, chainData.buyerDepositAmount, chainData.sellerDepositAmount)[0],
		4
	);
	const shortPnl = formatWithDecimalDigits(
		chainData.redeemLogicAccount?.state.getPnl(prices, chainData.buyerDepositAmount, chainData.sellerDepositAmount)[1],
		4
	);

	const handleOnPriceChange = (newValue: string, i: number) => {
		const pricesValueClone = _.clone(prices);
		pricesValueClone[i] = +newValue;
		setPrices(pricesValueClone);
	};

	return (
		<div className={cn(styles.wrapper, className)} ref={ref}>
			<p className={styles.title}>Simulate your PnL</p>
			{chainData.redeemLogicAccount.state.settlementPricesDescription.map((c, i) => (
				<div key={i} className={cn(styles.flex, styles.margin)}>
					<NumericField label={c} value={prices[i]} onChange={(newVal: number) => handleOnPriceChange(newVal.toString(), i)} />
				</div>
			))}

			<div className={styles.margin}>
				{chainData.redeemLogicAccount.state.pluginDetails.map((detail, index) => (
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
					<NumericBadge label={longPnl + ' ' + tokenSymbol} mode={longPnl > 0 ? 'success' : 'error'} />
				</div>
				<div className={styles.center}>
					Short
					<br />
					<NumericBadge label={shortPnl + ' ' + tokenSymbol} mode={shortPnl > 0 ? 'success' : 'error'} />
				</div>
			</div>

			<p className={styles.note}>
				This is the simulated PnL if{' '}
				{chainData.redeemLogicAccount.state.settlementPricesDescription.map((c, i) => (
					<span key={i}>
						{c.toLowerCase()} gets to {prices[i]}
						{i === chainData.redeemLogicAccount.state.settlementPricesDescription.length - 1 ? '' : ', '}
					</span>
				))}
			</p>
		</div>
	);
};

export default Simulator;

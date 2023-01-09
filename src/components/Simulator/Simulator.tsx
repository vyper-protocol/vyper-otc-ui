import { useState } from 'react';

import { Box, Typography } from '@mui/material';
import cn from 'classnames';
import NumericBadge from 'components/NumericBadge';
import NumericField from 'components/NumericField';
import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

import styles from './Simulator.module.scss';

type SimulatorProps = {
	chainData: ChainOtcState;
} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ chainData, className, ref }: SimulatorProps) => {
	const [prices, setPrices] = useState<number[]>(Array(10).fill(0));

	const tokenSymbol = chainData.collateralTokenInfo?.symbol.toUpperCase() ?? '';

	const [longPnl, shortPnl] = chainData.redeemLogicAccount?.state.getPnl(prices, chainData.buyerDepositAmount, chainData.sellerDepositAmount);

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
					<NumericField label={'Simulated ' + c.toLowerCase()} value={prices[i]} onChange={(newVal: number) => handleOnPriceChange(newVal.toString(), i)} />
				</div>
			))}

			<Box sx={{ display: 'flex', flexDirection: 'column', mx: 2 }} className={styles.margin}>
				{chainData.redeemLogicAccount.state.pluginDetails.map((detail, index) => (
					<div key={detail.label} className={cn(styles.flex, index % 2 && styles.row)}>
						<p className={styles.param}>{detail.label}</p>
						<p className={styles.param}>{typeof detail.value === 'number' ? formatWithDecimalDigits(detail.value, -1) : detail.value}</p>
					</div>
				))}
			</Box>
			<Box sx={{ mt: 2 }}>
				<Box className={styles.center} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Typography>Long</Typography>
					<NumericBadge label={formatWithDecimalDigits(longPnl, -1) + ' ' + tokenSymbol} mode={longPnl >= 0 ? 'success' : 'error'} />
				</Box>
				<Box className={styles.center} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Typography>Short</Typography>
					<NumericBadge label={formatWithDecimalDigits(shortPnl, -1) + ' ' + tokenSymbol} mode={shortPnl > 0 ? 'success' : 'error'} />
				</Box>
			</Box>
		</div>
	);
};

export default Simulator;

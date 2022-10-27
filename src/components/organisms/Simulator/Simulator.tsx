import { useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import { Badge, TextInput } from 'evergreen-ui';
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
	const tokenSymbol = rateStateQuery?.data?.reserveTokenInfo?.symbol;

	const buyerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicState?.getPnl(prices, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[0],
		4
	);
	const sellerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicState?.getPnl(prices, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[1],
		4
	);

	const buyerColor = buyerPnl > 0 ? 'green' : 'red';
	const sellerColor = sellerPnl > 0 ? 'green' : 'red';

	const handleOnPriceChange = (newValue: number, i: number) => {
		const pricesValueClone = _.clone(prices);
		pricesValueClone[i] = newValue;
		setPrices(pricesValueClone);
	};

	return (
		<div className={cn(styles.wrapper, className)} ref={ref}>
			<p className={styles.title}>Simulate your P/L</p>
			{rateStateQuery?.data.redeemLogicState.settlementPricesDescription.map((c, i) => (
				<div key={i} className={cn(styles.flex, styles.margin)}>
					<p>{c}:</p>
					<TextInput type="number" style={{ width: '70%' }} value={prices[i]} onChange={(e) => handleOnPriceChange(e.target.value, i)} />
				</div>
			))}

			<div className={styles.margin}>
				{rateStateQuery?.data?.redeemLogicState.pluginDetails.map((detail, index) => (
					<div key={detail.label} className={cn(styles.flex, index % 2 && styles.row)}>
						<p className={styles.bold}>{detail.label}</p>
						<p className={styles.bold}>{formatWithDecimalDigits(detail.value)}</p>
					</div>
				))}
			</div>

			{rateStateQuery?.data?.isPnlAvailable() && (
				<div className={cn(styles.flex, styles.margin)}>
					<div className={styles.center}>
						Long
						<br />
						<Badge color={buyerColor}>
							{buyerPnl} {tokenSymbol}
						</Badge>
					</div>
					<div className={styles.center}>
						Short
						<br />
						<Badge color={sellerColor}>
							{sellerPnl} {tokenSymbol}
						</Badge>
					</div>
				</div>
			)}

			<p className={styles.note}>
				{rateStateQuery?.data.redeemLogicState.settlementPricesDescription.length === 1
					? `*This is the simulated PnL if Current price gets to ${prices[0]}`
					: `*This is the simulated PnL if Current price gets to ${prices[0]} and Settlement rate gets to ${prices[1]}`}
			</p>
		</div>
	);
};

export default Simulator;

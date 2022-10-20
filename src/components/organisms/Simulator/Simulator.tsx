import { useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import { Badge, TextInput } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

import styles from './Simulator.module.scss';

type SimulatorProps = {} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ className, ref }: SimulatorProps) => {
	const router = useRouter();
	const { connection } = useConnection();
	const [price, setPrice] = useState(0);

	const { id } = router.query;

	const rateStateQuery = useGetFetchOTCStateQuery(connection, id as string);
	const tokenSymbol = rateStateQuery?.data?.reserveTokenInfo?.symbol;

	const buyerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicState?.getPnl(price, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[0],
		4
	);
	const sellerPnl = formatWithDecimalDigits(
		rateStateQuery?.data?.redeemLogicState?.getPnl(price, rateStateQuery?.data?.buyerDepositAmount, rateStateQuery?.data?.sellerDepositAmount)[1],
		4
	);

	const buyerColor = buyerPnl > 0 ? 'green' : 'red';
	const sellerColor = sellerPnl > 0 ? 'green' : 'red';

	const handleOnChange = (e) => {
		// Restrict input to 10 chars
		if (e.target.value >= 0 && e.target.value.length <= 10) {
			setPrice(e.target.value);
		} else {
			setPrice(0);
		}
	};

	return (
		<div className={cn(styles.wrapper, className)} ref={ref}>
			<p className={styles.title}>Simulate your P/L</p>
			<div className={cn(styles.flex, styles.margin)}>
				<p>Price: </p>
				<TextInput style={{ width: '70%' }} value={price} onChange={handleOnChange} />
			</div>
			<div className={styles.margin}>
				<div className={cn(styles.flex, styles.row)}>
					<p className={styles.bold}>Price</p>
					<p className={styles.bold}>{price}</p>
				</div>
				{rateStateQuery?.data?.redeemLogicState.getPluginDetails().map((detail, index) => (
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

			<p className={styles.note}>*That is your simulated P/L for both sides, if the price gets to {price}</p>
		</div>
	);
};

export default Simulator;

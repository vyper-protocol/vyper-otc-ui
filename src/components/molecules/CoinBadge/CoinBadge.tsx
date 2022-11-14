import { Chip } from '@mui/material';
import { TokenInfo } from 'models/TokenInfo';
import Image from 'next/image';

import styles from './CoinBadge.module.scss';

type Props = {
	title: string;
	amount: number;
	token: TokenInfo;
};

const CoinBadge = (props: Props) => {
	return (
		<div className={styles.container}>
			<p className={styles.title}>{props.title}</p>

			<div className={styles.chip}>
				<p className={styles.amount}>{props.amount}</p>

				<div className={styles.token}>
					<Image layout="fixed" width="16px" height="16px" src={props.token.logoURI} alt={props.token.symbol} />

					<p>{props.token.symbol}</p>
				</div>
			</div>
		</div>
	);
};

export default CoinBadge;

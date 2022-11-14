import { solscan } from 'configs/resources.json';
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

			<a href={`${solscan.baseUrl}/token/${props.token.address}`} target="_blank" rel="noopener noreferrer" className={styles.chip}>
				<p className={styles.amount}>{props.amount}</p>

				<div className={styles.token}>
					<Image layout="fixed" width="16px" height="16px" src={props.token.logoURI} alt={props.token.symbol} />

					<p>{props.token.symbol}</p>
				</div>
			</a>
		</div>
	);
};

export default CoinBadge;

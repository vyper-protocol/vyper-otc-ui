import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
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
			{props.token !== null && (
				<a
					href={getExplorerLink(props.token.address, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
					target="_blank"
					rel="noopener noreferrer"
					className={styles.chip}
				>
					<p className={styles.amount}>{props.amount}</p>

					<div className={styles.token}>
						<Image layout="fixed" width="16px" height="16px" src={props.token.logoURI} alt={props.token.symbol} />

						<p>{props.token.symbol}</p>
					</div>
				</a>
			)}

			{props.token === null && <p className={styles.amount}>{props.amount}</p>}
		</div>
	);
};

export default CoinBadge;

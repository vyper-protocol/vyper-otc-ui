import { Stack } from '@mui/material';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TokenInfo } from 'models/TokenInfo';
import Image from 'next/image';

import styles from './CoinBadge.module.scss';

type CoinBadgeProps = {
	title: string;
	amount: number;
	token: TokenInfo;
};

const CoinBadge = (props: CoinBadgeProps) => {
	return (
		<div className={styles.container}>
			<p className={styles.title}>{props.title}</p>

			{props.token !== null && (
				<a
					href={getExplorerLink(props.token.address, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} className={styles.chip}>
						<p className={styles.amount}>{props.amount}</p>
						<div className={styles.token}>
							<Image width="18px" height="18px" src={props.token.logoURI} alt={props.token.symbol} />
						</div>
					</Stack>
				</a>
			)}
			{props.token === null && <p className={styles.amount}>{props.amount}</p>}
		</div>
	);
};

export default CoinBadge;

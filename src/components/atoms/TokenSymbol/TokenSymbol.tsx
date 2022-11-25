import { Box } from '@mui/material';
import { TokenInfo } from 'models/TokenInfo';

import styles from './TokenSymbol.module.scss';

type TokenSymbolProps = {
	// token metadata
	token: TokenInfo;
};

// TODO: refactor with CoinBadge
const TokenSymbol = ({ token }: TokenSymbolProps) => {
	return (
		<span className={styles.container}>
			<span className={styles.symbol}>{token.symbol}</span>
			<Box className={styles.coin} component="img" src={token.logoURI} alt={token.symbol} />
		</span>
	);
};

export default TokenSymbol;

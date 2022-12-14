/* eslint-disable no-console */
import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import { getTokenMetadata as getCoingeckoTokenMetadata } from 'api/coingecko/getTokenMetadata';
import { fetchTokenInfoBySymbolCached } from 'api/next-api/fetchTokenInfo';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { OracleDetail } from 'models/OracleDetail';
import Marquee from 'react-fast-marquee';
import { useQuery } from 'react-query';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracles } from 'utils/oracleDatasetHelper';

import styles from './OracleMarqueeCard.module.scss';

type OracleMarqueeCardProps = {
	oracle: OracleDetail;
};

const OracleMarqueeCard = ({ oracle }: OracleMarqueeCardProps) => {
	const {
		pricesValue: [priceValue],
		isInitialized
	} = useOracleLivePrice(oracle.type, [oracle.pubkey]);

	const logoURIQuery = useQuery<string>(
		['logo-uri', oracle.baseCurrency],
		async () => {
			console.log('triggered coin asset fetching for ', oracle.baseCurrency);
			const localRes = await fetchTokenInfoBySymbolCached(oracle.baseCurrency);
			if (localRes) return localRes.logoURI;
			const coingeckoRes = await getCoingeckoTokenMetadata(oracle.baseCurrency);
			if (coingeckoRes?.image?.small) return coingeckoRes.image.small;
		},
		{
			// 7d
			cacheTime: 7 * 24 * 60 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			// refetchInterval: 5000
			// 2 min
			staleTime: 2 * 60 * 1000
		}
	);

	return (
		<Box className={styles.oracle_marquee_card}>
			<Stack justifyContent="center" direction="row" spacing={2}>
				{logoURIQuery?.data && <Box className={styles.coin} component="img" src={logoURIQuery?.data} alt={oracle.title} />}
				<div>
					<a href={oracle.explorerUrl} target="_blank" rel="noreferrer">
						{oracle.title}
					</a>
				</div>

				<div>{isInitialized && formatWithDecimalDigits(priceValue)}</div>
			</Stack>
		</Box>
	);
};

const SupportedAssetsMarquee = () => {
	const oracles = getOracles();

	return (
		<Marquee pauseOnHover>
			{oracles.map((oracle, idx) => (
				<OracleMarqueeCard key={idx} oracle={oracle} />
			))}
		</Marquee>
	);
};

export default SupportedAssetsMarquee;

/* eslint-disable no-console */
import LinkIcon from '@mui/icons-material/Link';
import { IconButton, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { getTokenMetadata as getCoingeckoTokenMetadata } from 'api/coingecko/getTokenMetadata';
import { fetchTokenInfoBySymbolCached } from 'api/next-api/fetchTokenInfo';
import axios from 'axios';
import CoinBadge from 'components/CoinBadge';
import TokenSymbol from 'components/TokenSymbol';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import _ from 'lodash';
import { OracleDetail } from 'models/OracleDetail';
import { TokenInfo } from 'models/TokenInfo';
import { useEffect, useState } from 'react';
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
			const localRes = await fetchTokenInfoBySymbolCached(oracle.baseCurrency);
			console.log('local result: ', localRes);

			if (localRes) {
				return localRes.logoURI;
			}
			const coingeckoRes = await getCoingeckoTokenMetadata(oracle.baseCurrency);
			console.log('coingecko result: ', coingeckoRes);
			if (coingeckoRes?.image?.small) {
				return coingeckoRes.image.small;
			}
		},
		{
			// 20min
			cacheTime: 20 * 60 * 1000,
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
				<div className={styles.title}>
					<a href={oracle.explorerUrl} target="_blank" rel="noreferrer">
						{oracle.title}
					</a>
				</div>

				<div className={styles.price}>{isInitialized && formatWithDecimalDigits(priceValue)}</div>
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

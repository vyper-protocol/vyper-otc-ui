/* eslint-disable no-console */

import { Skeleton } from '@mui/material';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

type OracleLivePriceInput = {
	oracleType: RatePluginTypeIds;
	pubkey: string;
};

const OracleLivePrice = ({ oracleType, pubkey }: OracleLivePriceInput) => {
	const { pricesValue, isInitialized } = useOracleLivePrice(oracleType, [pubkey]);
	return !isInitialized ? <Skeleton variant="rectangular" width={80} height={20} animation="wave" /> : <p>{formatWithDecimalDigits(pricesValue[0], 5)}</p>;
};

export default OracleLivePrice;

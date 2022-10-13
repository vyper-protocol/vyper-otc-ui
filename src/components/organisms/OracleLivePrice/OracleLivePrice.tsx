import { Text, Tooltip } from 'evergreen-ui';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';

type OracleLivePriceInput = {
	oracleType: RatePluginTypeIds;

	pubkey: string;
};

const OracleLivePrice = ({ oracleType, pubkey }: OracleLivePriceInput) => {
	return (
		<Tooltip content={oracleType} position="right">
			<Text>{pubkey}</Text>
		</Tooltip>
	);
};

export default OracleLivePrice;

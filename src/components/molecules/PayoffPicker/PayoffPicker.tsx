import { Box, Tab, Tabs, Typography } from '@mui/material';
import { AliasTypeIds, getPayoffFromAlias } from 'models/common';
import { getPayoffDocumentionLink, getPayoffSourceCodeLink, getPayoffDescription } from 'utils/payoffMetadataHelper';

type PayoffPickerProps = {
	// payoff of the contract
	aliasId: AliasTypeIds;

	// set callback, sets the redeem logic plugin type and the main rate puybey
	setAliasId: (newAliasId: AliasTypeIds) => void;
};

const buildDescription = (aliasId: AliasTypeIds) => {
	// eventually we can specialize description for alias
	// here we're using the parent payoff context
	const payoffId = getPayoffFromAlias(aliasId);

	return (
		<Box sx={{ marginY: 2 }}>
			<Typography>{getPayoffDescription(payoffId)}</Typography>
			<Box sx={{ display: 'flex', my: 1 }}>
				<a href={getPayoffDocumentionLink(payoffId)} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline' }}>Learn more</Typography>
				</a>
				<a href={getPayoffSourceCodeLink(payoffId)} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>Source code</Typography>
				</a>
			</Box>
		</Box>
	);
};

const PayoffPicker = ({ aliasId, setAliasId }: PayoffPickerProps) => {
	const uiAliasIds: AliasTypeIds[] = ['forward', 'vanilla option', 'digital option'];

	return (
		<Box sx={{ alignItems: 'center', marginY: 2, height: '180px' }}>
			<Tabs value={aliasId} onChange={(_, v) => setAliasId(v)}>
				{uiAliasIds.map((plugin) => (
					<Tab label={plugin} key={plugin} value={plugin} />
				))}
			</Tabs>
			{buildDescription(aliasId)}
		</Box>
	);
};

export default PayoffPicker;

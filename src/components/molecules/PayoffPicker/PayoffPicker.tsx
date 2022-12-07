import { Box, Tab, Tabs, Typography } from '@mui/material';
import { AliasTypeIds, getPayoffTypeIdFromAlias, PayoffTypeIds } from 'models/common';
import { getRedeemLogicDocumentionLink, getRedeemLogicSourceCodeLink, getRedeemLogicDescription } from 'utils/redeemLogicMetadataHelper';

export type PayoffPickerInput = {
	// redeem logic plugin of the contract
	aliasValue: AliasTypeIds;

	// set callback, sets the redeem logic plugin type and the main rate puybey
	setAliasValue: (newAlias: AliasTypeIds) => void;
};

const buildDescription = (aliasId: AliasTypeIds) => {
	// eventually we can specialize description for alias
	// here we're using the parent payoff context
	const rateId = getPayoffTypeIdFromAlias(aliasId);

	return (
		<Box sx={{ marginY: 2 }}>
			<Typography>{getRedeemLogicDescription(rateId)}</Typography>
			<Box sx={{ display: 'flex', my: 1 }}>
				<a href={getRedeemLogicDocumentionLink(rateId)} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline' }}>Learn more</Typography>
				</a>
				<a href={getRedeemLogicSourceCodeLink(rateId)} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>Source code</Typography>
				</a>
			</Box>
		</Box>
	);
};

export const PayoffPicker = ({ aliasValue, setAliasValue }: PayoffPickerInput) => {
	const uiRLTypes: AliasTypeIds[] = ['forward', 'forward2', 'vanilla_option', 'digital'];

	return (
		<Box sx={{ alignItems: 'center', marginY: 2, height: '180px' }}>
			<Tabs value={aliasValue} onChange={(_, v) => setAliasValue(v)}>
				{uiRLTypes.map((plugin) => (
					<Tab label={plugin} key={plugin} value={plugin} />
				))}
			</Tabs>
			{buildDescription(aliasValue)}
		</Box>
	);
};

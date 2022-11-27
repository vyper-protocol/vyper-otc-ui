import { Box, Tab, Tabs, Typography } from '@mui/material';
import { AVAILABLE_RL_TYPES, RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { getRedeemLogicDocumentionLink, getRedeemLogicSourceCodeLink, getRedeemLogicDescription } from 'utils/redeemLogicMetadataHelper';

export type PayoffPickerInput = {
	// redeem logic plugin of the contract
	redeemLogicPluginType: RLPluginTypeIds;

	// set callback, sets the redeem logic plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRedeemLogicPluginType: (redeemLogicPluginType: RLPluginTypeIds) => void;
};

const buildDescription = (rateId: RLPluginTypeIds) => {
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

export const PayoffPicker = ({ redeemLogicPluginType, setRedeemLogicPluginType }: PayoffPickerInput) => (
	<Box sx={{ alignItems: 'center', marginY: 2, height: '180px' }}>
		<Tabs value={redeemLogicPluginType} onChange={(_, v) => setRedeemLogicPluginType(v)}>
			{AVAILABLE_RL_TYPES.map((plugin) => (
				<Tab label={plugin} key={plugin} value={plugin} />
			))}
		</Tabs>
		{buildDescription(redeemLogicPluginType)}
	</Box>
);

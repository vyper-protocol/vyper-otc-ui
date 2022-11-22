import { Box, Tab, Tabs, Typography } from '@mui/material';
import { RLDigital } from 'models/plugins/redeemLogic/digital/RLDigital';
import { RLForward } from 'models/plugins/redeemLogic/forward/RLForward';
import { AVAILABLE_RL_TYPES, RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { RLSettledForward } from 'models/plugins/redeemLogic/settledForward/RLSettledForward';
import { RLVanillaOption } from 'models/plugins/redeemLogic/vanillaOption/RLVanillaOption';
import { getRedeemLogicDocumentionLink, getRedeemLogicSoruceCodeLink } from 'utils/urlBuilder';

export type PayoffPickerInput = {
	// redeem logic plugin of the contract
	redeemLogicPluginType: RLPluginTypeIds;

	// set callback, sets the redeem logic plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRedeemLogicPluginType: (redeemLogicPluginType: RLPluginTypeIds) => void;
};

const buildDescription = (rlType: RLPluginTypeIds) => {
	let description: string;
	const sourceLink = getRedeemLogicSoruceCodeLink(rlType);
	const docLink = getRedeemLogicDocumentionLink(rlType);

	switch (rlType) {
		case 'forward':
			description = RLForward.redeemLogicDescription;
			break;
		case 'settled_forward':
			description = RLSettledForward.redeemLogicDescription;
			break;
		case 'digital':
			description = RLDigital.redeemLogicDescription;
			break;
		case 'vanilla_option':
			description = RLVanillaOption.redeemLogicDescription;
			break;
		default:
			return;
	}
	return (
		<Box sx={{ marginY: 2 }}>
			<Typography>{description}</Typography>
			<Box sx={{ display: 'flex', my: 1 }}>
				<a href={docLink} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline' }}>Learn more</Typography>
				</a>
				<a href={sourceLink} target="_blank" rel="noopener noreferrer">
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

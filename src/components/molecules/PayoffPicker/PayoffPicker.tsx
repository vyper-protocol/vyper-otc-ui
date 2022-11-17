import { Box, Tab, Tabs, Typography } from '@mui/material';
import { AVAILABLE_REDEEM_LOGIC_PLUGINS, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { RedeemLogicDigitalPlugin } from 'models/plugins/redeemLogic/RedeemLogicDigitalPlugin';
import { RedeemLogicForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicSettledForwardPlugin';
import { RedeemLogicVanillaOptionPlugin } from 'models/plugins/redeemLogic/RedeemLogicVanillaOptionPlugin';
import { getRedeemLogicDocumentionLink } from 'utils/urlBuilder';

type PayoffPickerInput = {
	// redeem logic plugin of the contract
	redeemLogicPluginType: RedeemLogicPluginTypeIds;

	// set callback, sets the redeem logic plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRedeemLogicPluginType: (redeemLogicPluginType: RedeemLogicPluginTypeIds) => void;
};

const buildDescription = (redeemLogic: RedeemLogicPluginTypeIds) => {
	let description: string;
	let sourceLink;
	const docLink = getRedeemLogicDocumentionLink(redeemLogic);

	switch (redeemLogic) {
		case 'forward':
			description = RedeemLogicForwardPlugin.redeemLogicDescription;
			sourceLink = RedeemLogicForwardPlugin.sourceLink;
			break;
		case 'settled_forward':
			description = RedeemLogicSettledForwardPlugin.redeemLogicDescription;
			sourceLink = RedeemLogicSettledForwardPlugin.sourceLink;
			break;
		case 'digital':
			description = RedeemLogicDigitalPlugin.redeemLogicDescription;
			sourceLink = RedeemLogicDigitalPlugin.sourceLink;
			break;
		case 'vanilla_option':
			description = RedeemLogicVanillaOptionPlugin.redeemLogicDescription;
			sourceLink = RedeemLogicVanillaOptionPlugin.sourceLink;
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

const PayoffPicker = ({ redeemLogicPluginType, setRedeemLogicPluginType }: PayoffPickerInput) => {
	return (
		<Box sx={{ alignItems: 'center', marginY: 2, height: '180px' }}>
			<Tabs value={redeemLogicPluginType} onChange={(_, v) => setRedeemLogicPluginType(v)}>
				{AVAILABLE_REDEEM_LOGIC_PLUGINS.map((plugin) => (
					<Tab label={plugin} key={plugin} value={plugin} />
				))}
			</Tabs>
			{buildDescription(redeemLogicPluginType)}
		</Box>
	);
};

export default PayoffPicker;

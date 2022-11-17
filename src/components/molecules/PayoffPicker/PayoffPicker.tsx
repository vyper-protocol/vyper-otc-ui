import { Box, Tab, Tabs, Typography } from '@mui/material';
import { AVAILABLE_REDEEM_LOGIC_PLUGINS, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { RedeemLogicDigitalPlugin } from 'models/plugins/redeemLogic/RedeemLogicDigitalPlugin';
import { RedeemLogicForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicSettledForwardPlugin';
import { RedeemLogicVanillaOptionPlugin } from 'models/plugins/redeemLogic/RedeemLogicVanillaOptionPlugin';

const buildDescription = (redeemLogic: RedeemLogicPluginTypeIds) => {
	let description: string;
	let docLink;
	let sourceLink;

	switch (redeemLogic) {
		case 'forward':
			description = RedeemLogicForwardPlugin.redeemLogicDescription;
			docLink = RedeemLogicForwardPlugin.documentationLink;
			sourceLink = RedeemLogicForwardPlugin.sourceLink;
			break;
		case 'settled_forward':
			description = RedeemLogicSettledForwardPlugin.redeemLogicDescription;
			docLink = RedeemLogicSettledForwardPlugin.documentationLink;
			sourceLink = RedeemLogicSettledForwardPlugin.sourceLink;
			break;
		case 'digital':
			description = RedeemLogicDigitalPlugin.redeemLogicDescription;
			docLink = RedeemLogicDigitalPlugin.documentationLink;
			sourceLink = RedeemLogicDigitalPlugin.sourceLink;
			break;
		case 'vanilla_option':
			description = RedeemLogicVanillaOptionPlugin.redeemLogicDescription;
			docLink = RedeemLogicVanillaOptionPlugin.documentationLink;
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

const PayoffPicker = ({ value, onChange }) => {
	return (
		<Box sx={{ alignItems: 'center', marginY: 2, height: '180px' }}>
			{/* <b>{'SELECT PAYOFF'}</b> */}
			<Tabs value={value} onChange={(_, v) => onChange(v)}>
				{AVAILABLE_REDEEM_LOGIC_PLUGINS.map((plugin) => (
					<Tab label={plugin} key={plugin} value={plugin} />
				))}
			</Tabs>
			{buildDescription(value)}
		</Box>
	);
};

export default PayoffPicker;

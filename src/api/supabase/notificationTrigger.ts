/* eslint-disable no-console */
import { Cluster } from '@solana/web3.js';
import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { AbsRedeemLogicPlugin } from 'models/plugins/redeemLogic/AbsRedeemLogicPlugin';
import { RedeemLogicForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicForwardPlugin';
import moment from 'moment';
import { abbreviateAddress } from 'utils/stringHelpers';

import { SNS_PUBLISHER_RPC_NAME, supabase } from './client';

export const buildCreateContractMessage = (
	redeemLogicPluginType: RedeemLogicPluginTypeIds,
	underlying: string,
	redeemLogicState: AbsRedeemLogicPlugin,
	expiry: number,
	url: string
) => {
	return `New ${redeemLogicPluginType.toUpperCase()} contract created!
	
	Underlying: ${underlying}
	Strike: ${(redeemLogicState as RedeemLogicForwardPlugin).strike.toPrecision(4)}
	Size: ${(redeemLogicState as RedeemLogicForwardPlugin).notional}
	Expiry: ${moment(expiry).utc().format('D MMM yyyy hh:mm a [UTC]')}
	
	Trade now👇
	${url}`;
};

export const buildContractFundedMessage = (contractPublicKey: string, isSeniorSide: boolean, url: string): string => {
	return `Contract ${abbreviateAddress(contractPublicKey)} has been funded the ${isSeniorSide ? 'long' : 'short'} side!
	Check it here👇
	${url}`;
};

export const buildContractSettledMessage = (contractPublicKey: string, url: string): string => {
	return `Contract ${abbreviateAddress(contractPublicKey)} has been settled!
	Check it here👇
	${url}`;
};

export const sendSnsPublisherNotification = async (cluster: Cluster, content: string) => {
	console.log('sending: ', content);

	const { error } = await supabase.functions.invoke(SNS_PUBLISHER_RPC_NAME, {
		body: JSON.stringify({ cluster, content })
	});

	if (error) console.error(error);
};

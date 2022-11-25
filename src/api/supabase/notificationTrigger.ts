/* eslint-disable no-console */
import { Cluster } from '@solana/web3.js';
import { AbsRateState } from 'models/plugins/rate/AbsRateState';
import { AbsRLState } from 'models/plugins/redeemLogic/AbsRLState';
import { RLForward } from 'models/plugins/redeemLogic/forward/RLForward';
import moment from 'moment';
import { abbreviateAddress } from 'utils/stringHelpers';

import { SNS_PUBLISHER_RPC_NAME, supabase } from './client';

export const buildCreateContractMessage = (redeemLogicState: AbsRLState, rateState: AbsRateState, expiry: number, url: string) => {
	// TODO fix for other plugin types
	return `New ${redeemLogicState.getTypeLabel().toUpperCase()} contract created!
	
	Underlying: ${rateState.title}
	Strike: ${(redeemLogicState as RLForward).strike.toPrecision(4)}
	Size: ${(redeemLogicState as RLForward).notional}
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

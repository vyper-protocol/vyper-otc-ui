import { PublicKey } from '@solana/web3.js';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';

export type OtcInitializationParams = {
	reserveMint: PublicKey;

	seniorDepositAmount: number;
	juniorDepositAmount: number;

	depositStart: number;
	depositEnd: number;
	settleStart: number;

	redeemLogicOption: {
		strike: number;
		notional: number;
		isLinear: boolean;
	};

	rateOption: {
		ratePluginType: RatePluginTypeIds;
		rateAccount: PublicKey;
	};

	saveOnDatabase: boolean;
	sendNotification: boolean;
};

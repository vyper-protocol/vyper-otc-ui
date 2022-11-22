import { PublicKey } from '@solana/web3.js';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';

export type OtcInitializationParams = {
	reserveMint: PublicKey;

	seniorDepositAmount: number;
	juniorDepositAmount: number;

	depositStart: number;
	depositEnd: number;
	settleStart: number;

	// TODO: extend to other redeem logic
	redeemLogicOption: {
		redeemLogicPluginType: RLPluginTypeIds;
		strike?: number;
		notional?: number;
		isLinear?: boolean;
		isStandard?: boolean;
		isCall?: boolean;
	};

	rateOption: {
		ratePluginType: RatePluginTypeIds;
		rateAccounts: PublicKey[];
	};

	saveOnDatabase: boolean;
	sendNotification: boolean;
};

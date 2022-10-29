import { PublicKey } from '@solana/web3.js';
import { RatePluginTypeIds, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';

export type OtcInitializationParams = {
	reserveMint: PublicKey;

	seniorDepositAmount: number;
	juniorDepositAmount: number;

	depositStart: number;
	depositEnd: number;
	settleStart: number;

	// TODO: extend to other redeem logic
	redeemLogicOption: {
		redeemLogicPluginType: RedeemLogicPluginTypeIds;
		strike: number;
		notional: number;
		isLinear: boolean;
		isCall?: boolean;
	};

	rateOption: {
		ratePluginType: RatePluginTypeIds;
		rateAccounts: PublicKey[];
	};

	saveOnDatabase: boolean;
	sendNotification: boolean;
};

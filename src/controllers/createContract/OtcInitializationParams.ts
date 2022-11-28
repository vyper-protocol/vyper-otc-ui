import { Address, translateAddress } from '@project-serum/anchor';
import { Cluster, Connection } from '@solana/web3.js';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

export type OtcInitializationParams = {
	reserveMint: string;

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
		rateAccounts: string[];
	};

	saveOnDatabase: boolean;
	sendNotification: boolean;
};

export const getPriceForStrike = async (ratePluginType: RatePluginTypeIds, rateAccounts: Address[], connection: Connection, cluster: Cluster) => {
	let price = 0;
	try {
		if (ratePluginType === 'pyth') {
			const [, priceData] = await RatePythState.GetProductPrice(connection, cluster, translateAddress(rateAccounts[0]));
			price = priceData?.price ?? 0;
		}
		if (ratePluginType === 'switchboard') {
			// TODO fix fetching issue
			const priceData = await RateSwitchboardState.GetLatestPrice(connection, translateAddress(rateAccounts[0]));
			price = priceData ?? 0;
		}
	} catch {}

	return formatWithDecimalDigits(price);
};

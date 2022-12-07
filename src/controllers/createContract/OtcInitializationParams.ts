import { Address, translateAddress } from '@project-serum/anchor';
import { Cluster, Connection } from '@solana/web3.js';
import { RateTypeIds } from 'models/common';
import { PayoffTypeIds } from 'models/common';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

export type OtcInitializationParams = {
	collateralMint: string;

	longDepositAmount: number;
	shortDepositAmount: number;

	depositStart: number;
	depositEnd: number;
	settleStart: number;

	// TODO: extend to other redeem logic
	redeemLogicOption: {
		redeemLogicPluginType: PayoffTypeIds;
		strike?: number;
		notional?: number;
		isLinear?: boolean;
		isStandard?: boolean;
		isCall?: boolean;
	};

	rateOption: {
		ratePluginType: RateTypeIds;
		rateAccounts: string[];
	};

	saveOnDatabase: boolean;
	sendNotification: boolean;
};

export const getPriceForStrike = async (ratePluginType: RateTypeIds, rateAccounts: Address[], connection: Connection, cluster: Cluster) => {
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

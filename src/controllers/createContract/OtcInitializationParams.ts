/* eslint-disable no-console */
import { Address, translateAddress } from '@project-serum/anchor';
import { Cluster, Connection } from '@solana/web3.js';
import { AliasTypeIds, RateTypeIds } from 'models/common';
import { PayoffTypeIds } from 'models/common';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';

export type OtcInitializationParams = {
	collateralMint: string;

	longDepositAmount: number;
	shortDepositAmount: number;

	depositStart: number;
	depositEnd: number;
	settleStart: number;

	aliasId: AliasTypeIds;

	// TODO: extend to other redeem logic
	payoffOption: {
		payoffId: PayoffTypeIds;
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

	referralCode: string | undefined;
	isFeatured: boolean;

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

	return price;
};

/**
 *
 * @param val init parameters to validate
 * @returns return an array with all the validation errors, an empty array means the object is valid
 */
export const validateInitParams = (val: OtcInitializationParams): string[] => {
	try {
		const errors: string[] = [];
		if (val.depositStart > val.depositEnd) errors.push('Contract deposit start must be before deposit end');
		if (val.depositEnd > val.settleStart) errors.push('Contract expiry must be after the deposit end');
		if (val.rateOption.rateAccounts.length === 0) errors.push('No oracle provided');
		return errors;
	} catch (err) {
		console.error(err);
		if (process.env.NODE_ENV === 'development') return [err.message];
		else ['unknown error, plese retry later'];
	}
};

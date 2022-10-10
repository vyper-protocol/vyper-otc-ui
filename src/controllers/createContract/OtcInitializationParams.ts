import { PublicKey } from '@solana/web3.js';

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
		switchboardAggregator: PublicKey;
	};

	// depositIsSeniorSide: boolean;
	// beneficiaryTokenAccount: PublicKey;
};

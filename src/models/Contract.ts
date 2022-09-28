import { PublicKey } from '@solana/web3.js';

import RateSwitchboardState from './RateSwitchboardState';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';

export interface IContract {
	pubkey: string;
	asset: string;
	stats: [
		{
			name: 'Asset Price';
			value: string;
		},
		{
			name: 'Leverage';
			value: string;
		},
		{
			name: 'Collateral';
			value: string;
		},
		{
			name: 'Duration';
			value: string;
		},
		{
			name: 'Strike';
			value: number;
		}
	];
	timestamps: [
		{
			name: 'Created at';
			value: string;
		},
		{ name: 'Deposit expire'; value: string },
		{
			name: 'Settle available';
			value: string;
		}
	];
	amounts: {
		seniorDepositAmount: number;
		juniorDepositAmount: number;
		seniorReserveTokens: number;
		juniorReserveTokens: number;
	};
	conditions: {
		isDepositSeniorAvailable: boolean;
		isDepositJuniorAvailable: boolean;
	};
	beneficiaries: {
		seniorAccount: PublicKey;
		seniorOwner: PublicKey;
		juniorAccount: PublicKey;
		juniorOwner: PublicKey;
	};
	states: {
		redeemLogicState: RedeemLogicForwardState;
		rateState: RateSwitchboardState;
	};
	aggregatorLastValue: number;
}

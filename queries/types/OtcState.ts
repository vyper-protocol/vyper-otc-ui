import { PublicKey } from '@solana/web3.js';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';
import RateSwitchboardState from './RateSwitchboardState';

const MILISECONDS = 1000;

export class OtcState {
	publickey: PublicKey;

	created_sec: number;
	depositExpiration_sec: number;
	settleAvailableFrom_sec: number;
	settleExecuted: boolean;

	seniorDepositAmount: number;
	juniorDepositAmount: number;

	otcSeniorReserveTokenAccountAmount: number;
	otcJuniorReserveTokenAccountAmount: number;

	seniorSideBeneficiaryTokenAccount: undefined | PublicKey;
	seniorSideBeneficiaryOwner: undefined | PublicKey;
	juniorSideBeneficiaryTokenAccount: undefined | PublicKey;
	juniorSideBeneficiaryOwner: undefined | PublicKey;

	redeemLogicState: RedeemLogicForwardState;
	rateState: RateSwitchboardState;

	get isDepositSeniorAvailable(): boolean {
		// current UTC timestamp in seconds
		const nowSeconds = Math.round(Date.now() / MILISECONDS);
		return nowSeconds < this.depositExpiration_sec && this.seniorSideBeneficiaryTokenAccount == null;
	}

	get isDepositJuniorAvailable(): boolean {
		// current UTC timestamp in seconds
		const nowSeconds = Math.round(Date.now() / MILISECONDS);
		return nowSeconds < this.depositExpiration_sec && this.juniorSideBeneficiaryTokenAccount == null;
	}

	get isSettlementAvailable(): boolean {
		// current UTC timestamp in seconds
		const nowSeconds = Math.round(Date.now() / MILISECONDS);
		return nowSeconds > this.settleAvailableFrom_sec && !this.settleExecuted;
	}

	get isClaimAvailable(): boolean {
		return this.settleExecuted;
	}

	get isClaimSeniorAvailable(): boolean {
		return this.settleExecuted && this.otcSeniorReserveTokenAccountAmount > 0;
	}

	get isClaimJuniorAvailable(): boolean {
		return this.settleExecuted && this.otcJuniorReserveTokenAccountAmount > 0;
	}
}

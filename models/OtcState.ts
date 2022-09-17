import { PublicKey } from '@solana/web3.js';

import RateSwitchboardState from './RateSwitchboardState';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';

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

	isDepositExpired(): boolean {
		// current UTC timestamp in seconds
		const nowSeconds = Math.round(Date.now() / MILISECONDS);
		return nowSeconds > this.depositExpiration_sec;
	}

	isDepositSeniorAvailable(): boolean {
		return !this.isDepositExpired && this.seniorSideBeneficiaryTokenAccount == null;
	}

	isDepositJuniorAvailable(): boolean {
		return !this.isDepositExpired && this.juniorSideBeneficiaryTokenAccount == null;
	}

	isSettlementAvailable(): boolean {
		// current UTC timestamp in seconds
		const nowSeconds = Math.round(Date.now() / MILISECONDS);
		return nowSeconds > this.settleAvailableFrom_sec && !this.settleExecuted;
	}

	isClaimAvailable(): boolean {
		return this.settleExecuted;
	}

	isClaimSeniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.settleExecuted &&
			this.seniorSideBeneficiaryOwner.equals(currentUserWallet) &&
			this.otcSeniorReserveTokenAccountAmount > 0
		);
	}

	isClaimJuniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.settleExecuted &&
			this.juniorSideBeneficiaryOwner.equals(currentUserWallet) &&
			this.otcJuniorReserveTokenAccountAmount > 0
		);
	}

	isWithdrawSeniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.isDepositExpired &&
			this.seniorSideBeneficiaryTokenAccount != null &&
			this.juniorSideBeneficiaryTokenAccount == null &&
			this.seniorSideBeneficiaryOwner.equals(currentUserWallet) &&
			this.otcSeniorReserveTokenAccountAmount > 0
		);
	}

	isWithdrawJuniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.isDepositExpired &&
			this.seniorSideBeneficiaryTokenAccount == null &&
			this.juniorSideBeneficiaryTokenAccount != null &&
			this.juniorSideBeneficiaryOwner.equals(currentUserWallet) &&
			this.otcJuniorReserveTokenAccountAmount > 0
		);
	}
}

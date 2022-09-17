import { PublicKey } from '@solana/web3.js';

import RateSwitchboardState from './RateSwitchboardState';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';

const MILISECONDS = 1000;

export class OtcState {
	/**
	 * Current Contract public key
	 */
	publickey: PublicKey;

	/**
	 * Creation timestamp in ms
	 */
	createdAt: number;

	/**
	 * Deposit expiration timestamp in ms
	 */
	depositExpirationAt: number;

	/**
	 * Settlement available from timestamp in ms
	 */
	settleAvailableFromAt: number;

	/**
	 * Flag for the settlement execution
	 */
	settleExecuted: boolean;

	/**
	 * Amount of tokens the buyer needs to deposit
	 */
	buyerDepositAmount: number;

	/**
	 * Amount of tokens the seller needs to deposit
	 */
	sellerDepositAmount: number;

	/**
	 * OTC program token account for buyer tokens
	 */
	programBuyerTAAmount: number;

	/**
	 * OTC program token account for seller tokens
	 */
	programSellerTAAmount: number;

	/**
	 * Buyer wallet
	 */
	buyerWallet: undefined | PublicKey;

	/**
	 * Buyer token account
	 */
	buyerTA: undefined | PublicKey;

	/**
	 * Seller wallet
	 */
	sellerWallet: undefined | PublicKey;

	/**
	 * Seller token account
	 */
	sellerTA: undefined | PublicKey;

	/**
	 * Redeem logic state
	 */
	redeemLogicState: RedeemLogicForwardState;

	/**
	 * Rate state
	 */
	rateState: RateSwitchboardState;

	isDepositExpired(): boolean {
		return Date.now() > this.depositExpirationAt;
	}

	isDepositSeniorAvailable(): boolean {
		return !this.isDepositExpired && this.buyerTA == null;
	}

	isDepositJuniorAvailable(): boolean {
		return !this.isDepositExpired && this.sellerTA == null;
	}

	isSettlementAvailable(): boolean {
		return Date.now() > this.settleAvailableFromAt && !this.settleExecuted;
	}

	isClaimAvailable(): boolean {
		return this.settleExecuted;
	}

	isClaimSeniorAvailable(currentUserWallet: PublicKey): boolean {
		return this.settleExecuted && this.buyerWallet.equals(currentUserWallet) && this.programBuyerTAAmount > 0;
	}

	isClaimJuniorAvailable(currentUserWallet: PublicKey): boolean {
		return this.settleExecuted && this.sellerWallet.equals(currentUserWallet) && this.programSellerTAAmount > 0;
	}

	isWithdrawSeniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.isDepositExpired &&
			this.buyerTA != null &&
			this.sellerTA == null &&
			this.buyerWallet.equals(currentUserWallet) &&
			this.programBuyerTAAmount > 0
		);
	}

	isWithdrawJuniorAvailable(currentUserWallet: PublicKey): boolean {
		return (
			this.isDepositExpired &&
			this.buyerTA == null &&
			this.sellerTA != null &&
			this.sellerWallet.equals(currentUserWallet) &&
			this.programSellerTAAmount > 0
		);
	}
}

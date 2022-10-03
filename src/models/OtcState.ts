/* eslint-disable space-before-function-paren */
import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import RateSwitchboardState from './RateSwitchboardState';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';

export class OtcState {
	/**
	 * Current Contract public key
	 */
	publickey: PublicKey;

	/**
	 * Reserve mint info
	 */
	reserveMintInfo: Mint;

	/**
	 * Creation timestamp in ms
	 */
	createdAt: number;

	/**
	 * Deposit available from timestamp in ms
	 */
	depositAvailableFrom: number;

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

	isDepositBuyerAvailable(currentUserWallet: PublicKey): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return !this.isDepositExpired() && this.buyerTA === null && currentUserWallet.toBase58() !== this.sellerWallet?.toBase58();
	}

	isBuyerFunded(): boolean {
		return this.buyerTA != null;
	}

	isDepositSellerAvailable(currentUserWallet: PublicKey): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return !this.isDepositExpired() && this.sellerTA === null && currentUserWallet.toBase58() !== this.buyerWallet?.toBase58();
	}

	isSellerFunded(): boolean {
		return this.sellerTA != null;
	}

	isSettlementAvailable(): boolean {
		return Date.now() > this.settleAvailableFromAt && !this.settleExecuted;
	}

	isClaimSeniorAvailable(currentUserWallet: PublicKey | undefined): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return this.settleExecuted && this.buyerWallet.equals(currentUserWallet) && this.programBuyerTAAmount > 0;
	}

	isClaimJuniorAvailable(currentUserWallet: PublicKey | undefined): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return this.settleExecuted && this.sellerWallet.equals(currentUserWallet) && this.programSellerTAAmount > 0;
	}

	isWithdrawSeniorAvailable(currentUserWallet: PublicKey | undefined): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return (
			this.isDepositExpired && this.buyerTA !== null && this.sellerTA === null && this.buyerWallet.equals(currentUserWallet) && this.programBuyerTAAmount > 0
		);
	}

	isWithdrawJuniorAvailable(currentUserWallet: PublicKey | undefined): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return (
			this.isDepositExpired && this.buyerTA === null && this.sellerTA !== null && this.sellerWallet.equals(currentUserWallet) && this.programSellerTAAmount > 0
		);
	}
}

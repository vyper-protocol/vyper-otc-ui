import { PublicKey } from '@solana/web3.js';

import { ContractStatusIds } from './common';
import { PayoffAccount } from './plugins/payoff/PayoffAccount';
import { RateAccount } from './plugins/rate/RateAccount';

export abstract class AbsOtcState {
	/**
	 * Current Contract public key
	 */
	publickey: PublicKey;

	/**
	 * VyperCore account pubkey
	 */
	vyperCoreTrancheConfig: PublicKey;

	/**
	 * Collateral mint info
	 */
	collateralMint: PublicKey;

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
	 * Amount of tokens the buyer needs to deposit
	 */
	buyerDepositAmount: number;

	/**
	 * Amount of tokens the seller needs to deposit
	 */
	sellerDepositAmount: number;

	/**
	 * Redeem logic account
	 */
	redeemLogicAccount: PayoffAccount;

	/**
	 * Rate account
	 */
	rateAccount: RateAccount;

	/**
	 * Get the contract current status
	 */
	get contractStatus(): ContractStatusIds {
		if (!this.isDepositExpired()) {
			// both sides unfunded
			if (!this.isLongFunded() && !this.isShortFunded()) return 'unfunded';

			// only one side is funded
			if (this.isLongFunded() && !this.isShortFunded()) return 'wtb';
			if (!this.isLongFunded() && this.isShortFunded()) return 'wts';

			// both sides funded
			return 'live';
		} else {
			// on side unfunded
			if (!this.isLongFunded() || !this.isShortFunded()) return 'expired';

			if (!this.settleExecuted) return 'live';
			else return 'settled';
		}
	}

	/**
	 * Get true if settlement is already executed
	 */
	abstract get settleExecuted(): boolean;

	abstract isLongFunded(): boolean;
	abstract isShortFunded(): boolean;

	isDepositExpired(): boolean {
		return Date.now() > this.depositExpirationAt;
	}
}

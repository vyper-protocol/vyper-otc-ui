import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import RateSwitchboardState from './RateSwitchboardState';
import { RedeemLogicForwardState } from './RedeemLogicForwardState';

export abstract class AbsOtcState {
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
	 * Amount of tokens the buyer needs to deposit
	 */
	buyerDepositAmount: number;

	/**
	 * Amount of tokens the seller needs to deposit
	 */
	sellerDepositAmount: number;

	/**
	 * Redeem logic state
	 */
	redeemLogicState: RedeemLogicForwardState;

	/**
	 * Rate state
	 */
	rateState: RateSwitchboardState;
}

/* eslint-disable eqeqeq */
/* eslint-disable space-before-function-paren */
import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { AbsOtcState } from './AbsOtcState';
import { TokenInfo } from './TokenInfo';

export const AVAILABLE_CONTRACT_STATUS_IDS = ['active', 'expired'] as const;
export type ContractStatusIds = typeof AVAILABLE_CONTRACT_STATUS_IDS[number];

export class ChainOtcState extends AbsOtcState {
	/**
	 * Reserve mint info
	 */
	reserveMintInfo: Mint;

	/**
	 * Reserve token info
	 */
	reserveTokenInfo?: TokenInfo;

	/**
	 * Flag for the settlement execution
	 */
	settleExecuted: boolean;

	/**
	 * Price at settlement
	 */
	pricesAtSettlement: number[] | undefined;

	/**
	 * OTC program token amount for buyer tokens
	 */
	programBuyerTAAmount: number;

	/**
	 * OTC program token account for buyer tokens
	 */
	programBuyerTA: PublicKey;

	/**
	 * OTC program token amount for seller tokens
	 */
	programSellerTAAmount: number;

	/**
	 * OTC program token account for seller tokens
	 */
	programSellerTA: PublicKey;

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

	getContractTitle(): string {
		return this.rateAccount.state.title;
	}

	isDepositExpired(): boolean {
		return Date.now() > this.depositExpirationAt;
	}

	areBothSidesFunded(): boolean {
		return this.buyerWallet != undefined && this.sellerWallet != undefined;
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
		return Date.now() > this.settleAvailableFromAt && !this.settleExecuted && this.buyerWallet !== undefined && this.sellerWallet !== undefined;
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
			this.isDepositExpired() && this.buyerTA !== null && this.sellerTA === null && this.buyerWallet.equals(currentUserWallet) && this.programBuyerTAAmount > 0
		);
	}

	isWithdrawJuniorAvailable(currentUserWallet: PublicKey | undefined): boolean {
		if (currentUserWallet === undefined || currentUserWallet === null) return false;
		return (
			this.isDepositExpired() &&
			this.buyerTA === null &&
			this.sellerTA !== null &&
			this.sellerWallet.equals(currentUserWallet) &&
			this.programSellerTAAmount > 0
		);
	}

	// getContractStatus(): ContractStatusIds {
	// 	const currentTime = Date.now();
	// 	if (currentTime > this.settleAvailableFromAt || (currentTime > this.depositExpirationAt && !this.areBothSidesFunded())) {
	// 		return 'expired';
	// 	}
	// 	return 'active';
	// }

	get contractStatus(): ContractStatusIds {
		const currentTime = Date.now();
		if (currentTime > this.settleAvailableFromAt || (currentTime > this.depositExpirationAt && !this.areBothSidesFunded())) {
			return 'expired';
		}
		return 'active';
	}

	isPnlAvailable(): boolean {
		return this.areBothSidesFunded();
	}

	getPnlBuyer(prices: number[]): number {
		const priceToUse = this.settleExecuted ? this.pricesAtSettlement : prices;
		return this.redeemLogicAccount.state.getPnl(priceToUse, this.buyerDepositAmount, this.sellerDepositAmount)[0];
	}

	getPnlSeller(prices: number[]): number {
		const priceToUse = this.settleExecuted ? this.pricesAtSettlement : prices;
		return this.redeemLogicAccount.state.getPnl(priceToUse, this.buyerDepositAmount, this.sellerDepositAmount)[1];
	}
}

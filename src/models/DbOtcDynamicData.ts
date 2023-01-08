export class DbOtcDynamicData {
	pubkey: string;
	title: string;

	buyerTA: undefined | string;
	buyerWallet: undefined | string;
	sellerTA: undefined | string;
	sellerWallet: undefined | string;

	settleExecuted: boolean;
	pricesAtSettlement: undefined | number[];
	pnlBuyer: undefined | number;
	pnlSeller: undefined | number;
	buyerClaimed: boolean;
	sellerClaimed: boolean;

	static createFromDBData(data: any): DbOtcDynamicData {
		const res = new DbOtcDynamicData();
		res.pubkey = data.pubkey;

		res.title = data.title;

		res.buyerTA = data.buyer_ta;
		res.buyerWallet = data.buyer_wallet;
		res.sellerTA = data.seller_ta;
		res.sellerWallet = data.seller_wallet;

		res.settleExecuted = data.settle_executed;
		if (res.settleExecuted) {
			res.pnlBuyer = data.pnl_buyer;
			res.pnlSeller = data.pnl_seller;
			res.pricesAtSettlement = [data.prices_at_settlement_1];
			if (data.prices_at_settlement_2) res.pricesAtSettlement.push(data.prices_at_settlement_2);
		}
		res.buyerClaimed = data.buyer_claimed;
		res.sellerClaimed = data.seller_claimed;

		return res;
	}
}

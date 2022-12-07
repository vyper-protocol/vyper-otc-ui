/* eslint-disable no-console */
/* eslint-disable camelcase */
import { ChainOtcState } from 'models/ChainOtcState';

import { CONTRACTS_DYNAMIC_DATA_TABLE_NAME, supabase } from './client';

export const syncContractFromChain = async (otcState: ChainOtcState) => {
	console.log('sync contract dynamic data');

	let pricesAtSettlement1 = undefined;
	let pricesAtSettlement2 = undefined;
	let pnlBuyer = undefined;
	let pnlSeller = undefined;

	if (otcState.settleExecuted) {
		try {
			pricesAtSettlement1 = otcState.pricesAtSettlement[0];
			if (otcState.pricesAtSettlement.length > 1) pricesAtSettlement2 = otcState.pricesAtSettlement[1];

			pnlBuyer = otcState.getLongPnl(otcState.pricesAtSettlement);
			pnlSeller = otcState.getShortPnl(otcState.pricesAtSettlement);
		} catch {}
	}

	const contractDynamicData = {
		pubkey: otcState.publickey.toBase58(),

		title: otcState.getContractTitle(),

		buyer_ta: otcState.buyerTA?.toBase58(),
		buyer_wallet: otcState.buyerWallet?.toBase58(),

		seller_ta: otcState.sellerTA?.toBase58(),
		seller_wallet: otcState.sellerWallet?.toBase58(),

		settle_executed: otcState.settleExecuted,

		prices_at_settlement_1: pricesAtSettlement1,
		prices_at_settlement_2: pricesAtSettlement2,

		pnl_buyer: pnlBuyer,
		pnl_seller: pnlSeller
	};

	// check if entry exists
	const { data: selectData, error: selectError } = await supabase
		.from(CONTRACTS_DYNAMIC_DATA_TABLE_NAME)
		.select('pubkey')
		.eq('pubkey', otcState.publickey.toBase58())
		.maybeSingle();

	if (selectError) {
		console.error('error: ', selectError);
		return;
	}

	if (selectData) {
		console.log('update contract dynamic data for pubkey: ' + otcState.publickey.toBase58());
		const { error } = await supabase.from(CONTRACTS_DYNAMIC_DATA_TABLE_NAME).update([contractDynamicData]).eq('pubkey', otcState.publickey.toBase58());
		if (error) {
			console.error('error: ', error);
		}
	} else {
		console.log('insert new contract dynamic data for pubkey: ' + otcState.publickey.toBase58());
		const { error } = await supabase.from(CONTRACTS_DYNAMIC_DATA_TABLE_NAME).insert([contractDynamicData]);
		if (error) {
			console.error('error: ', error);
		}
	}
};

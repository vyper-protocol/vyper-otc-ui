/* eslint-disable no-console */
/* eslint-disable camelcase */
import { ChainOtcState } from 'models/ChainOtcState';

import { CONTRACTS_DYNAMIC_DATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const syncContractFromChain = async (otcState: ChainOtcState) => {
	console.log('sync contract dynamic data');

	try {
		// check first if static data is present on db
		const entryExistsInContracts = await checkIfEntryExistsInTable(CONTRACTS_TABLE_NAME, 'pubkey', otcState.publickey.toBase58());
		if (!entryExistsInContracts) {
			console.log('contract static data not found on database, skip dynamic data saving');
			return;
		}

		let pricesAtSettlement1 = undefined;
		let pricesAtSettlement2 = undefined;
		let pnlBuyer = undefined;
		let pnlSeller = undefined;
		let buyerClaimed = false;
		let sellerClaimed = false;
		if (otcState.settleExecuted) {
			try {
				pricesAtSettlement1 = otcState.pricesAtSettlement[0];
				if (otcState.pricesAtSettlement.length > 1) pricesAtSettlement2 = otcState.pricesAtSettlement[1];

				pnlBuyer = otcState.getLongPnl(otcState.pricesAtSettlement);
				pnlSeller = otcState.getShortPnl(otcState.pricesAtSettlement);

				buyerClaimed = otcState.programBuyerTAAmount === 0;
				sellerClaimed = otcState.programSellerTAAmount === 0;
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
			pnl_seller: pnlSeller,

			buyer_claimed: buyerClaimed,
			seller_claimed: sellerClaimed
		};

		// check if entry exists
		const dynamicDataExists = await checkIfEntryExistsInTable(CONTRACTS_DYNAMIC_DATA_TABLE_NAME, 'pubkey', otcState.publickey.toBase58());

		if (dynamicDataExists) {
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
	} catch (err) {
		console.error('error: ', err);
		return;
	}
};

async function checkIfEntryExistsInTable(table: string, column: string, value: any): Promise<boolean> {
	const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq(column, value);

	if (error) {
		console.error('error: ', error);
		throw Error(error.message);
	}

	return count > 0;
}

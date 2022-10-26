/* eslint-disable camelcase */
import { Cluster, PublicKey } from '@solana/web3.js';
import { ChainOtcState } from 'models/ChainOtcState';

import { CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const cloneContractFromChain = async (otcState: ChainOtcState, createdBy: PublicKey, cluster: Cluster, metadata: any = {}) => {
	await supabase.from(CONTRACTS_TABLE_NAME).insert([
		{
			cluster: cluster,
			pubkey: otcState.publickey.toBase58(),
			tranche_config_pubkey: otcState.vyperCoreTrancheConfig.toBase58(),
			reserve_mint: otcState.reserveMintInfo.address.toBase58(),
			created_at: new Date(otcState.createdAt),
			deposit_available_from: new Date(otcState.depositAvailableFrom),
			deposit_expiration_at: new Date(otcState.depositExpirationAt),
			settle_available_from: new Date(otcState.settleAvailableFromAt),
			buyer_deposit_amount: otcState.buyerDepositAmount,
			seller_deposit_amount: otcState.sellerDepositAmount,

			redeem_logic_plugin_program_pubkey: otcState.redeemLogicState.programPubkey.toBase58(),
			redeem_logic_plugin_state_pubkey: otcState.redeemLogicState.statePubkey.toBase58(),
			redeem_logic_plugin_type: otcState.redeemLogicState.typeId,
			redeem_logic_plugin_data: otcState.redeemLogicState.getPluginDataObj(),

			rate_plugin_program_pubkey: otcState.rateState.programPubkey.toBase58(),
			rate_plugin_state_pubkey: otcState.rateState.statePubkey.toBase58(),
			rate_plugin_type: otcState.rateState.typeId,
			rate_plugin_data: otcState.rateState.getPluginDataObj()
		}
	]);

	await supabase.from(CONTRACTS_METADATA_TABLE_NAME).insert([
		{
			pubkey: otcState.publickey.toBase58(),
			created_by: createdBy.toBase58(),
			metadata: metadata
		}
	]);
};

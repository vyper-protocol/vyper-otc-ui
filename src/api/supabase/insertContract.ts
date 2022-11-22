/* eslint-disable camelcase */
import { translateAddress } from '@project-serum/anchor';
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

			redeem_logic_plugin_program_pubkey: translateAddress(otcState.redeemLogicAccount.programPubkey).toBase58(),
			redeem_logic_plugin_state_pubkey: translateAddress(otcState.redeemLogicAccount.statePubkey).toBase58(),
			redeem_logic_plugin_type: otcState.redeemLogicAccount.state.stateType.type,
			redeem_logic_plugin_data: otcState.redeemLogicAccount.state.getPluginDataObj(),

			rate_plugin_program_pubkey: translateAddress(otcState.rateAccount.programPubkey).toBase58(),
			rate_plugin_state_pubkey: translateAddress(otcState.rateAccount.statePubkey).toBase58(),
			rate_plugin_type: otcState.rateAccount.state.typeId,
			rate_plugin_data: otcState.rateAccount.state.getPluginDataObj()
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

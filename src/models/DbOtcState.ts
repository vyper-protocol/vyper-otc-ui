import { Cluster, PublicKey } from '@solana/web3.js';

import { AbsOtcState } from './AbsOtcState';
import { DbOtcStateMetadata } from './DbOtcStateMetadata';
import { RatePythPlugin } from './plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from './plugins/rate/RateSwitchboardPlugin';
import { RedeemLogicForwardPlugin } from './plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from './plugins/redeemLogic/RedeemLogicSettledForwardPlugin';
import { RedeemLogicDigitalPlugin } from './plugins/redeemLogic/RedeemLogicDigitalPlugin';
import { RedeemLogicVanillaOptionPlugin } from './plugins/redeemLogic/RedeemLogicVanillaOptionPlugin';
import { RatePluginTypeIds, RedeemLogicPluginTypeIds } from './plugins/AbsPlugin';

export class DbOtcState extends AbsOtcState {
	cluster: Cluster;
	metadata: DbOtcStateMetadata;

	static fromSupabaseSelectRes(data: any): DbOtcState {
		const res = new DbOtcState();
		res.cluster = data.cluster as Cluster;
		res.publickey = new PublicKey(data.pubkey);
		res.vyperCoreTrancheConfig = new PublicKey(data.tranche_config_pubkey);
		res.reserveMint = new PublicKey(data.reserve_mint);
		res.buyerDepositAmount = data.buyer_deposit_amount;
		res.sellerDepositAmount = data.seller_deposit_amount;

		const redeemLogicPluginType: RedeemLogicPluginTypeIds = data.redeem_logic_plugin_type;

		if (redeemLogicPluginType === 'forward') {
			res.redeemLogicState = new RedeemLogicForwardPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.isLinear,
				data.redeem_logic_plugin_data.notional
			);
		} else if (redeemLogicPluginType === 'settled_forward') {
			res.redeemLogicState = new RedeemLogicSettledForwardPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.isLinear,
				data.redeem_logic_plugin_data.notional,
				data.redeem_logic_plugin_data.isStandard
			);
		} else if (redeemLogicPluginType === 'digital') {
			res.redeemLogicState = new RedeemLogicDigitalPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.isCall
			);
		} else if (redeemLogicPluginType === 'vanilla_option') {
			res.redeemLogicState = new RedeemLogicVanillaOptionPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.notional,
				data.redeem_logic_plugin_data.isCall,
				data.redeem_logic_plugin_data.isLinear
			);
		} else {
			throw Error('reedem logic plugin not supported: ' + redeemLogicPluginType);
		}

		const ratePluginType: RatePluginTypeIds = data.rate_plugin_type;

		if (ratePluginType === 'switchboard') {
			if (data.rate_plugin_data.switchboardAggregator) {
				res.rateState = new RateSwitchboardPlugin(new PublicKey(data.rate_plugin_program_pubkey), new PublicKey(data.rate_plugin_state_pubkey), [
					new PublicKey(data.rate_plugin_data.switchboardAggregator)
				]);
			} else {
				res.rateState = new RateSwitchboardPlugin(
					new PublicKey(data.rate_plugin_program_pubkey),
					new PublicKey(data.rate_plugin_state_pubkey),
					data.rate_plugin_data.oracles.map((c) => new PublicKey(c))
				);
			}
		} else if (ratePluginType === 'pyth') {
			if (data.rate_plugin_data.pythProduct) {
				res.rateState = new RatePythPlugin(new PublicKey(data.rate_plugin_program_pubkey), new PublicKey(data.rate_plugin_state_pubkey), [
					new PublicKey(data.rate_plugin_data.pythProduct)
				]);
			} else {
				res.rateState = new RatePythPlugin(
					new PublicKey(data.rate_plugin_program_pubkey),
					new PublicKey(data.rate_plugin_state_pubkey),
					data.rate_plugin_data.oracles.map((c) => new PublicKey(c))
				);
			}
		} else {
			throw Error('rate plugin not supported: ' + ratePluginType);
		}

		res.createdAt = new Date(data.create_at).getTime();
		res.depositAvailableFrom = new Date(data.deposit_available_from).getTime();
		res.depositExpirationAt = new Date(data.deposit_expiration_at).getTime();
		res.settleAvailableFromAt = new Date(data.settle_available_from).getTime();

		if (data.contracts_metadata) {
			res.metadata = new DbOtcStateMetadata(new PublicKey(data.contracts_metadata[0].created_by), data.contracts_metadata[0].metadata);
		}
		return res;
	}
}

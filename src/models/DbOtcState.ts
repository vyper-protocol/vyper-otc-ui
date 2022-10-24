import { Cluster, PublicKey } from '@solana/web3.js';

import { AbsOtcState } from './AbsOtcState';
import { DbOtcStateMetadata } from './DbOtcStateMetadata';
import { RatePythPlugin } from './plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from './plugins/rate/RateSwitchboardPlugin';
import { RedeemLogicForwardPlugin } from './plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from './plugins/redeemLogic/RedeemLogicSettledForwardPlugin';

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

		if (data.redeem_logic_plugin_type === 'forward') {
			res.redeemLogicState = new RedeemLogicForwardPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.isLinear,
				data.redeem_logic_plugin_data.notional
			);
		}

		if (data.redeem_logic_plugin_type === 'settled_forward') {
			res.redeemLogicState = new RedeemLogicSettledForwardPlugin(
				new PublicKey(data.redeem_logic_plugin_program_pubkey),
				new PublicKey(data.redeem_logic_plugin_state_pubkey),
				data.redeem_logic_plugin_data.strike,
				data.redeem_logic_plugin_data.isLinear,
				data.redeem_logic_plugin_data.notional
			);
		}

		if (data.rate_plugin_type === 'switchboard') {
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
		} else if (data.rate_plugin_type === 'pyth') {
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
			throw Error('rate plugin not supported: ' + data.rate_plugin_type);
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

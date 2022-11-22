import { Cluster, PublicKey } from '@solana/web3.js';

import { AbsOtcState } from './AbsOtcState';
import { DbOtcStateMetadata } from './DbOtcStateMetadata';
import { createRateStateFromDBData } from './plugins/rate/createRateStateFromDBData';
import { RateAccount } from './plugins/rate/RateAccount';
import { createRLStateFromDBData } from './plugins/redeemLogic/createRLStateFromDBData';
import { RLAccount } from './plugins/redeemLogic/RLAccount';

export class DbOtcState extends AbsOtcState {
	cluster: Cluster;
	metadata: DbOtcStateMetadata;

	static createFromDBData(data: any): DbOtcState {
		const res = new DbOtcState();
		res.cluster = data.cluster as Cluster;
		res.publickey = new PublicKey(data.pubkey);
		res.vyperCoreTrancheConfig = new PublicKey(data.tranche_config_pubkey);
		res.reserveMint = new PublicKey(data.reserve_mint);
		res.buyerDepositAmount = data.buyer_deposit_amount;
		res.sellerDepositAmount = data.seller_deposit_amount;

		const rlState = createRLStateFromDBData(String(data.redeem_logic_plugin_type), data.redeem_logic_plugin_data);
		res.redeemLogicAccount = new RLAccount(data.redeem_logic_plugin_program_pubkey, data.redeem_logic_plugin_state_pubkey, rlState);

		const rateState = createRateStateFromDBData(String(data.rate_plugin_type), data.rate_plugin_data);
		res.rateAccount = new RateAccount(data.rate_plugin_program_pubkey, data.rate_plugin_state_pubkey, rateState);

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

import { Cluster, PublicKey } from '@solana/web3.js';

import { AbsOtcState } from './AbsOtcState';
import { ContractStatusIds } from './ChainOtcState';
import { DbOtcDynamicData } from './DbOtcDynamicData';
import { DbOtcStateMetadata } from './DbOtcStateMetadata';
import { createPayoffStateFromDBData } from './plugins/payoff/createPayoffStateFromDBData';
import { PayoffAccount } from './plugins/payoff/PayoffAccount';
import { createRateStateFromDBData } from './plugins/rate/createRateStateFromDBData';
import { RateAccount } from './plugins/rate/RateAccount';

export class DbOtcState extends AbsOtcState {
	cluster: Cluster;
	metadata: DbOtcStateMetadata;
	dynamicData: DbOtcDynamicData;

	isLongFunded(): boolean {
		if (this.dynamicData && this.dynamicData.buyerWallet) return true;
		return false;
	}

	isShortFunded(): boolean {
		if (this.dynamicData && this.dynamicData.sellerWallet) return true;
		return false;
	}

	get contractStatus(): ContractStatusIds {
		const currentTime = Date.now();
		if (currentTime > this.settleAvailableFromAt || (currentTime > this.depositExpirationAt && !this.areBothSidesFunded())) {
			return 'expired';
		}
		return 'active';
	}

	areBothSidesFunded(): boolean {
		return this.isLongFunded() && this.isShortFunded();
	}

	static createFromDBData(data: any): DbOtcState {
		const res = new DbOtcState();
		res.cluster = data.cluster as Cluster;
		res.publickey = new PublicKey(data.pubkey);
		res.vyperCoreTrancheConfig = new PublicKey(data.tranche_config_pubkey);
		res.collateralMint = new PublicKey(data.reserve_mint);
		res.buyerDepositAmount = data.buyer_deposit_amount;
		res.sellerDepositAmount = data.seller_deposit_amount;

		const rlState = createPayoffStateFromDBData(String(data.redeem_logic_plugin_type), data.redeem_logic_plugin_data);
		res.redeemLogicAccount = new PayoffAccount(data.redeem_logic_plugin_program_pubkey, data.redeem_logic_plugin_state_pubkey, rlState);

		const rateState = createRateStateFromDBData(String(data.rate_plugin_type), data.rate_plugin_data);
		res.rateAccount = new RateAccount(data.rate_plugin_program_pubkey, data.rate_plugin_state_pubkey, rateState);

		res.createdAt = new Date(data.created_at).getTime();
		res.depositAvailableFrom = new Date(data.deposit_available_from).getTime();
		res.depositExpirationAt = new Date(data.deposit_expiration_at).getTime();
		res.settleAvailableFromAt = new Date(data.settle_available_from).getTime();

		if (data.contracts_metadata && data.contracts_metadata.length) {
			res.metadata = DbOtcStateMetadata.createFromDBData(data.contracts_metadata[0]);
		}
		if (data.contracts_dynamic_data && data.contracts_dynamic_data.length) {
			res.dynamicData = DbOtcDynamicData.createFromDBData(data.contracts_dynamic_data[0]);
		}
		return res;
	}
}

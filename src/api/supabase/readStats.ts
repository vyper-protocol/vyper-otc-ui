import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { AVAILABLE_PAYOFF_TYPE_IDS, AVAILABLE_RATE_TYPE_IDS } from 'models/common';

import { CONTRACTS_TABLE_NAME, supabase } from './client';

export type ContractsStats = {
	// number of contracts saved in the database
	numberOfContracts: number;

	// number of contracts where settle data is in the future
	numberOfLiveContracts: number;
};

export const readStats = async (): Promise<ContractsStats> => {
	const { count: numberOfContracts } = await supabase
		.from(CONTRACTS_TABLE_NAME)
		.select('*', { count: 'exact' })
		.eq('cluster', getCurrentCluster())
		.in('redeem_logic_plugin_type', AVAILABLE_PAYOFF_TYPE_IDS as any)
		.in('rate_plugin_type', AVAILABLE_RATE_TYPE_IDS as any);
	const liveContractsQuery = supabase.from(CONTRACTS_TABLE_NAME).select('*', { count: 'exact' }).eq('cluster', getCurrentCluster());

	const d = new Date();
	liveContractsQuery.gt('settle_available_from', d.toUTCString());
	const { count: numberOfLiveContracts } = await liveContractsQuery;

	return { numberOfContracts, numberOfLiveContracts };
};

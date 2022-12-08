import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';

import { CONTRACTS_DYNAMIC_DATA_TABLE_NAME, CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export type ContractsStats = {
	// number of contracts saved in the database
	numberOfContracts: number;

	// number of contracts where settle data is in the future
	numberOfLiveContracts: number;
};

export const readStats = async (): Promise<ContractsStats> => {
	const { count: numberOfContracts } = await supabase.from(CONTRACTS_TABLE_NAME).select('*', { count: 'exact', head: true }).eq('cluster', getCurrentCluster());

	const now = new Date().toISOString();
	const { count: depositOpenContracts } = await supabase
		.from(CONTRACTS_TABLE_NAME)
		.select('*', { count: 'exact', head: true })
		.eq('cluster', getCurrentCluster())
		.gt('deposit_available_from', now)
		.lt('deposit_expiration_at', now);
	const { count: depositClosedContracts } = await supabase
		.from(CONTRACTS_TABLE_NAME)
		.select(
			`
					*,
					ignore:${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}!inner(*),
					${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}(*)
			`,
			{ count: 'exact', head: true }
		)
		.eq('cluster', getCurrentCluster())
		.gt('settle_available_from', now)
		.lt('deposit_expiration_at', now)
		.not(`${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}.buyer_wallet`, 'is', null)
		.not(`${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}.seller_wallet`, 'is', null);

	return { numberOfContracts, numberOfLiveContracts: depositClosedContracts + depositOpenContracts };
};

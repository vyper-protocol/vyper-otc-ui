import { ContractsStats, readStats } from 'api/supabase/readStats';
import { useQuery, UseQueryResult } from 'react-query';

export const useGetPlatformStatsQuery = (): UseQueryResult<ContractsStats> => {
	return useQuery<ContractsStats>(
		[],
		() => {
			return readStats();
		},
		{
			// 10min
			cacheTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			// refetchInterval: 5000
			// 2 min
			staleTime: 2 * 60 * 1000
		}
	);
};

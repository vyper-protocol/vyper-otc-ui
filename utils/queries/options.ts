import { queryClient } from 'pages/_app';

const MILISECONDS = 1000;
const SECONDS = 60;
const MINUTES = 30;

/**
 * Create the queries default options
 * @param queryKey
 * @param queryParam
 * @returns
 */
export const defaultOptions = (queryKey: string, queryParam?: string) => {
	let placeholder = queryClient.getQueryData<any>(queryKey);
	if (queryParam) {
		placeholder = queryClient.getQueryData<any>(queryKey)?.find((d: any) => {
			return d.id === queryParam;
		});
	}

	return {
		// Set cache time to 30 mins
		cacheTime: MILISECONDS * SECONDS * MINUTES,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		// Provide placeholder data from the cache
		placeholderData: placeholder
	};
};

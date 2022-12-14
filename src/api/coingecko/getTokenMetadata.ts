import axios from 'axios';

import coinsList from './coins_list.json';

export const getTokenMetadata = async (symbol: string): Promise<any> => {
	const symbolLowerCase = symbol.toLowerCase();
	const token = coinsList.find((c) => c.symbol.toLowerCase().includes(symbolLowerCase) || c.name.toLowerCase().includes(symbolLowerCase.toLowerCase()));
	if (!token) return undefined;

	return await commonAxiosGet('https://api.coingecko.com/api/v3/coins/' + token.id);
};
const commonAxiosGet = async (path: string): Promise<any> => {
	try {
		const axiosRes = await axios.get(path);
		if (axiosRes.status === 200) {
			return axiosRes.data;
		} else {
			return undefined;
		}
	} catch (err) {
		return undefined;
	}
};

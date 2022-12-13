/* eslint-disable no-console */
import { selectAllContracts } from 'api/supabase/selectAllContracts';
import { DbOtcState } from 'models/DbOtcState';

const fetchContracts = async (): Promise<DbOtcState[]> => {
	try {
		const res = await selectAllContracts();
		return res;
	} catch (error) {
		console.error(error);
		return [];
	}
};

export default fetchContracts;

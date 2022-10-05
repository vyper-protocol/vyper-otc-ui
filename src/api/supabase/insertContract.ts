/* eslint-disable camelcase */
import { PublicKey } from '@solana/web3.js';

import { supabase } from './client';

const CONTRACT_TABLE_NAME = 'contract';

export const insertContract = async (contract: PublicKey, createdBy: PublicKey, metadata: any = {}) => {
	await supabase.from(CONTRACT_TABLE_NAME).insert([
		{
			pubkey: contract.toBase58(),
			metadata: metadata,
			created_by: createdBy.toBase58()
		}
	]);
};

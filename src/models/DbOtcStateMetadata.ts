import { PublicKey } from '@solana/web3.js';

import { AliasTypeIds } from './common';

export class DbOtcStateMetadata {
	constructor(public createdBy: PublicKey, public aliasId: AliasTypeIds, public data: any, public referralCode: string | undefined) {
		//
	}

	static createFromDBData(v: any): DbOtcStateMetadata {
		const createdBy = new PublicKey(v.created_by);
		const alias = v.alias;
		const data = v.metadata;

		return new DbOtcStateMetadata(createdBy, alias, data, v.referral_code);
	}
}

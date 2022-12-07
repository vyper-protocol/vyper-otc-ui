import { PublicKey } from '@solana/web3.js';

import { AliasTypeIds } from './common';

export class DbOtcStateMetadata {
	constructor(public createdBy: PublicKey, public alias: AliasTypeIds, public data: any) {
		//
	}

	static createFromDBData(v: any): DbOtcStateMetadata {
		const createdBy = new PublicKey(v.created_by);
		const alias = v.alias;
		const data = v.metadata;

		return new DbOtcStateMetadata(createdBy, alias, data);
	}
}

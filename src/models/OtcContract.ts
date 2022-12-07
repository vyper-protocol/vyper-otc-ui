import { ChainOtcState } from './ChainOtcState';
import { AliasTypeIds } from './common';
import { DbOtcState } from './DbOtcState';

export class OtcContract {
	constructor(public chainData: ChainOtcState, public dbData?: DbOtcState) {
		//
	}

	get alias(): AliasTypeIds {
		if (this.dbData && this.dbData.metadata && this.dbData.metadata.alias) {
			return this.dbData.metadata.alias;
		}

		return this.chainData.redeemLogicAccount.state.payoffId;
	}
}

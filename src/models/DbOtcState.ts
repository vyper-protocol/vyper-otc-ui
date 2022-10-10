import { AbsOtcState } from './AbsOtcState';
import { DbOtcStateMetadata } from './DbOtcStateMetadata';

export class DbOtcState extends AbsOtcState {
	metadata: DbOtcStateMetadata;
}

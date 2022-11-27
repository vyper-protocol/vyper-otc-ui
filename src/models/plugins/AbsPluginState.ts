export abstract class AbsPluginState {
	abstract getPluginDataObj(): any;
	abstract clone(): AbsPluginState;
}

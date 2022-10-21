import { AbsPlugin, RedeemLogicPluginTypeIds } from '../AbsPlugin';

export type RedeemLogicPluginDetail = {
	label: string;
	value: number;
	tooltip?: string;
};

export abstract class AbsRedeemLogicPlugin extends AbsPlugin {
	// eslint-disable-next-line no-unused-vars
	abstract clone(): AbsRedeemLogicPlugin;
	abstract getTypeId(): RedeemLogicPluginTypeIds;

	abstract getPluginDetails(): RedeemLogicPluginDetail[];

	abstract getPnl(price: number, buyerDepositAmount: number, sellerDepositAmount: number): [number, number];

	abstract getNotionLink(): string;
}

import { RLPluginTypeIds } from './plugins/redeemLogic/RLStateType';

export type MetadataDetails = {
	// eslint-disable-next-line no-unused-vars
	[redeemLogicId in RLPluginTypeIds]: {
		documentationLink: string;
		sourceCodeLink: string;
		description: string;
	};
};

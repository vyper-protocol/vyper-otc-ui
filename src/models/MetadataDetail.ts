import { PayoffTypeIds } from './common';

export type MetadataDetails = {
	// eslint-disable-next-line no-unused-vars
	[redeemLogicId in PayoffTypeIds]: {
		documentationLink: string;
		sourceCodeLink: string;
		description: string;
	};
};

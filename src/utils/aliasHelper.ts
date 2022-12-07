import { AliasTypeIds } from 'models/common';

export const getSidesLabel = (aliasId: AliasTypeIds): [string, string] => {
	return isOptionAlias(aliasId) ? ['Option premium', 'Option collateral'] : ['Long collateral', 'Short collateral'];
};

export const getSidesLabelShort = (aliasId: AliasTypeIds): [string, string] => {
	return isOptionAlias(aliasId) ? ['Buyer', 'Seller'] : ['Long', 'Short'];
};

export const isOptionAlias = (aliasId: AliasTypeIds): boolean => {
	switch (aliasId) {
		case 'forward':
		case 'settled_forward':
			return false;
		case 'vanilla_option':
		case 'vanilla option':
		case 'digital':
		case 'digital option':
			return true;
		default:
			return false;
	}
};

export const needsNotional = (aliasId: AliasTypeIds): boolean => {
	switch (aliasId) {
		case 'forward':
		case 'settled_forward':
		case 'vanilla_option':
		case 'vanilla option':
			return true;
		case 'digital':
		case 'digital option':
			return false;
		default:
			return false;
	}
};

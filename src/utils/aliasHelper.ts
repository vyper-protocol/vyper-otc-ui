import { AliasTypeIds, getPayoffFromAlias } from 'models/common';

export const getAliasLabel = (aliasId: AliasTypeIds): string => {
	// this should become more comprehensive if we change aliasId representation
	switch (aliasId) {
		case 'vanilla_option':
			return 'vanilla option';
		case 'digital':
			return 'digital option';
		case 'settled_forward':
			return 'settled forward';
		default:
			return aliasId.toString();
	}
};

export const getSidesLabel = (aliasId: AliasTypeIds): [string, string] => {
	return isOptionAlias(aliasId) ? ['Option premium', 'Option collateral'] : ['Long collateral', 'Short collateral'];
};

export const getSidesLabelShort = (aliasId: AliasTypeIds): [string, string] => {
	return isOptionAlias(aliasId) ? ['Buyer', 'Seller'] : ['Long', 'Short'];
};

export const isOptionAlias = (aliasId: AliasTypeIds): boolean => {
	switch (getPayoffFromAlias(aliasId)) {
		case 'forward':
		case 'settled_forward':
			return false;
		case 'vanilla_option':
		case 'digital':
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
			return true;
		case 'digital':
			return false;
		default:
			return false;
	}
};

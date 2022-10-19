export const buildHomeUrl = (): string => {
	return '/';
};

export const buildContractSummaryUrl = (contractAddress: string): string => {
	return `/contract/summary/${contractAddress}`;
};

export const buildCreateContractUrl = (): string => {
	return '/contract/create';
};

export const buildExplorerUrl = (): string => {
	return '/explorer';
};

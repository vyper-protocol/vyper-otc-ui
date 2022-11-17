import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';

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

export function buildDepositQRCodeUrl(contract: string, isBuyer: boolean): string {
	return `/qr?op=deposit&contract=${contract}&isBuyer=${isBuyer}`;
}

export function getRedeemLogicDocumentionLink(t: RedeemLogicPluginTypeIds): string {
	switch (t) {
		case 'digital':
			return 'https://vyperprotocol.notion.site/Contract-Payoff-Digital-39cab877a28a4a6fa349d9b816bd15a4';
		case 'forward':
			return 'https://vyperprotocol.notion.site/Contract-Payoff-Forward-0475d7640cd946f5be4a03d5e6bcad76';
		case 'settled_forward':
			return 'https://vyperprotocol.notion.site/Contract-Payoff-Settled-Forward-aa0f295f291545c281be6fa6363ca79a';
		case 'vanilla_option':
			return 'https://vyperprotocol.notion.site/Contract-Payoff-Vanilla-Option-47b362270a164d7b96732d139e4d7ee2';
		default:
			return '#';
	}
}

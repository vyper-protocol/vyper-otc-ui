import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { RateTypeIds } from 'models/common';

export function getSwitchboardExplorer() {
	return getCurrentCluster() === 'devnet' ? 'https://staging.switchboard.xyz/explorer' : 'https://switchboard.xyz/explorer';
}

export function getPythExplorer() {
	return getCurrentCluster() === 'devnet' ? 'https://pyth.network/price-feeds?cluster=devnet' : 'https://pyth.network/price-feeds?cluster=mainnet-beta';
}

export function getRateExplorer(rateId: RateTypeIds) {
	switch (rateId) {
		case 'pyth':
			return getPythExplorer();
		case 'switchboard':
			return getSwitchboardExplorer();
		default:
			return '';
	}
}

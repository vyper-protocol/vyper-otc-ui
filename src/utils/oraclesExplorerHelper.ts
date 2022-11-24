import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';

export function getSwitchboardExplorer() {
	return getCurrentCluster() === 'devnet' ? 'https://staging.switchboard.xyz/explorer' : 'https://switchboard.xyz/explorer';
}

export function getPythExplorer() {
	return getCurrentCluster() === 'devnet' ? 'https://pyth.network/price-feeds?cluster=devnet' : 'https://pyth.network/price-feeds?cluster=mainnet-beta';
}

export function getRateExplorer(rateId: RatePluginTypeIds) {
	switch (rateId) {
		case 'pyth':
			return getPythExplorer();
		case 'switchboard':
			return getSwitchboardExplorer();
		default:
			return '';
	}
}

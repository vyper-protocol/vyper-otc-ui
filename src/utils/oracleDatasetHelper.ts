import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import oraclesData from 'configs/oracles.json';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';

export function getOracles(): OracleDetail[] {
	const oraclesList = oraclesData.oracles as OracleDetail[];
	return oraclesList.filter(({ cluster }) => cluster === getCurrentCluster());
}

export function getOracleByPubkey(val: PublicKey): OracleDetail | undefined {
	return getOracles().find(({ pubkey }) => pubkey === val.toBase58());
}

export function getOraclesByType(val: RatePluginTypeIds): OracleDetail[] {
	return getOracles().filter(({ type }) => type === val);
}

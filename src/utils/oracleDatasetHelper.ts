import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import oraclesData from 'configs/oracles.json';
import { RateTypeIds } from 'models/common';
import { OracleDetail } from 'models/OracleDetail';

export function getOracles(): OracleDetail[] {
	const oraclesList = oraclesData.oracles as OracleDetail[];
	return oraclesList.filter(({ cluster }) => cluster === getCurrentCluster());
}

export function getOracleByPubkey(val: PublicKey | string): OracleDetail | undefined {
	return getOracles().find(({ pubkey }) => pubkey === (typeof val === 'string' ? val : val.toBase58()));
}

export function getOraclesByType(val: RateTypeIds): OracleDetail[] {
	return getOracles().filter(({ type }) => type === val);
}

export function getOraclesByTitle(rateTitle: string, rateId: RateTypeIds): OracleDetail | undefined {
	return getOracles().find(({ type, title }) => type === rateId && title === rateTitle);
}

export function getOraclesNumber(): number {
	return getOracles().length;
}

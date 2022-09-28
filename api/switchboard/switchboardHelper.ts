import { AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount, loadSwitchboardProgram } from '@switchboard-xyz/switchboard-v2';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';

/**
 * @param provider
 * @param aggregator
 * @returns Aggregator's latest value
 */
export const getAggregatorLatestValue = async (provider: AnchorProvider, aggregator: PublicKey): Promise<number> => {
	const program = await loadSwitchboardProgram('devnet', provider.connection);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	const latestResult = await aggregatorAccount.getLatestValue();
	return latestResult.toNumber();
};

export const getAggregatorData = async (provider: AnchorProvider, aggregator: PublicKey): Promise<any> => {
	const program = await loadSwitchboardProgram(
		RPC_ENDPOINTS.find((c) => c.endpoints.includes(provider.connection.rpcEndpoint)).cluster as
			| 'devnet'
			| 'mainnet-beta',
		provider.connection
	);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	return await aggregatorAccount.loadData();
};

export const getAggregatorName = async (connection: Connection, aggregator: PublicKey): Promise<any> => {
	const program = await loadSwitchboardProgram(
		RPC_ENDPOINTS.find((c) => c.endpoints.includes(connection.rpcEndpoint)).cluster as 'devnet' | 'mainnet-beta',
		connection
	);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	const data = await aggregatorAccount.loadData();
	return String.fromCharCode.apply(null, data.name).split('\u0000')[0];
};

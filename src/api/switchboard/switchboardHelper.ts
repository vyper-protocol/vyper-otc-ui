import { AnchorProvider, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount, getSwitchboardPid, loadSwitchboardProgram, SwitchboardProgram } from '@switchboard-xyz/switchboard-v2';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';

import SwitchboardIdlDevnet from './idl_switchboard_devnet.json';
import SwitchboardIdlMainnet from './idl_switchboard_mainnet.json';

/**
 * @param provider
 * @param aggregator
 * @returns Aggregator's latest value
 */
export const getAggregatorLatestValue = async (connection: Connection, aggregator: PublicKey): Promise<number> => {
	const program = await loadSwitchboardProgram('devnet', connection);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	const latestResult = await aggregatorAccount.getLatestValue();
	return latestResult.toNumber();
};

export const getAggregatorData = async (connection: Connection, aggregator: PublicKey): Promise<any> => {
	const program = await loadSwitchboardProgram(
		RPC_ENDPOINTS.find((c) => {
			return c.endpoints.includes(connection.rpcEndpoint);
		}).cluster as 'devnet' | 'mainnet-beta',
		connection
	);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	return await aggregatorAccount.loadData();
};

export const getAggregatorName = async (connection: Connection, aggregator: PublicKey): Promise<any> => {
	const program = await loadSwitchboardProgram(
		RPC_ENDPOINTS.find((c) => {
			return c.endpoints.includes(connection.rpcEndpoint);
		}).cluster as 'devnet' | 'mainnet-beta',
		connection
	);

	const aggregatorAccount = new AggregatorAccount({
		program,
		publicKey: aggregator
	});

	const data = await aggregatorAccount.loadData();
	return AggregatorAccount.getName(data);
};

export const loadSwitchboardProgramOffline = (cluster: 'devnet' | 'mainnet-beta', connection: Connection): SwitchboardProgram => {
	const idl = cluster === 'devnet' ? SwitchboardIdlDevnet : (SwitchboardIdlMainnet as any);
	return new Program(idl, getSwitchboardPid(cluster), new AnchorProvider(connection, undefined, {}));
};

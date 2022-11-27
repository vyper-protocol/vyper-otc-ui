import { useEffect, useState } from 'react';

import { Box, Stack, Autocomplete, TextField, Typography, Alert } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { getOracleByPubkey, getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';
import { getRateExplorer } from 'utils/oraclesExplorerHelper';

type OraclePickerInput = {
	// label of the oracle
	rateLabel: string;

	// rates allowed
	options: OracleDetail[];

	// rate account pubkey
	pubkey: string;

	// set callback, sets the rate plugin type
	setRatePlugin: (type: RatePluginTypeIds, pubkey: string) => void;
};

async function getOracleDetail(connection: Connection, cluster: Cluster, pubkey: string): Promise<OracleDetail> {
	try {
		const localData = getOracleByPubkey(pubkey);
		if (localData) return localData;

		const publicKey = new PublicKey(pubkey);

		const [productData] = await RatePythState.GetProductPrice(connection, cluster, publicKey);
		if (productData) {
			return {
				type: 'pyth',
				title: productData.symbol,
				cluster,
				explorerUrl: getRateExplorer('pyth'),
				pubkey
			};
		}

		const aggregatorData = await RateSwitchboardState.LoadAggregatorData(connection, publicKey);
		if (aggregatorData) {
			return {
				type: 'switchboard',
				title: String.fromCharCode(...aggregatorData.name),
				cluster,
				explorerUrl: getRateExplorer('switchboard'),
				pubkey
			};
		}

		return undefined;
	} catch {
		return undefined;
	}
}

const OraclePicker = ({ rateLabel, options, pubkey, setRatePlugin }: OraclePickerInput) => {
	console.log('rendered with ', pubkey);

	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();

	const [isLoading, setIsLoading] = useState(false);

	const [oracleDetail, setOracleDetail] = useState<OracleDetail>(undefined);
	useEffect(() => {
		getOracleDetail(connection, currentCluster, pubkey).then((v) => {
			setOracleDetail(v);
		});
	}, [pubkey]);

	const [label, setLabel] = useState(<></>);

	return (
		<>
			<Autocomplete
				sx={{ width: 300, marginY: 2 }}
				autoHighlight
				selectOnFocus
				clearOnBlur
				handleHomeEndKeys
				disableClearable
				loading={isLoading}
				freeSolo={currentCluster === 'devnet'}
				value={oracleDetail?.title}
				onInputChange={async (_, val: string, reason: string) => {
					if (reason !== 'input') return;

					setIsLoading(true);
					try {
						console.log('onInputChange triggered: val=', val);
						const res = await getOracleDetail(connection, currentCluster, val);

						if (res) {
							setOracleDetail(res);
							setRatePlugin(res.type, res.pubkey);
							setLabel(
								<Box sx={{ paddingX: '16px', paddingY: '6px' }}>
									<Typography component="span">{res.title}</Typography>
									<Typography component="span" sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }}>
										{res.type.toUpperCase()}
									</Typography>
								</Box>
							);
						} else {
							setLabel(
								<Box sx={{ paddingY: '6px' }}>
									<Alert severity="error">The name / public key is not a recognized oracle.</Alert>
								</Box>
							);
						}
					} finally {
						setIsLoading(false);
					}
				}}
				getOptionLabel={(oracle: string | OracleDetail) => (typeof oracle === 'string' ? oracle : oracle.title)}
				renderOption={(props, option: OracleDetail) => (
					<Box component="li" {...props}>
						<Typography align="left">{option.title}</Typography>
						<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
							{option.type.toUpperCase()}
						</Typography>
					</Box>
				)}
				options={options}
				renderInput={(params) => (
					<>
						<TextField {...params} label={rateLabel} />
						{label}
					</>
				)}
				onChange={async (_, val: OracleDetail | string) => {
					console.log('onChange triggered: val=', val);
					if (typeof val === 'object') {
						setRatePlugin((val as OracleDetail).type, (val as OracleDetail).pubkey);
						setLabel(<></>);
					}
				}}
			/>
			{oracleDetail?.explorerUrl && (
				<a href={oracleDetail?.explorerUrl ?? '#'} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>View in explorer</Typography>
				</a>
			)}
		</>
	);
};

export type OraclesPickerInput = {
	oracleRequired: 'single' | 'double';
	ratePluginType: RatePluginTypeIds;
	rateAccounts: string[];
	setRateAccounts: (newType: RatePluginTypeIds, newVal: string[]) => void;
};

// TODO Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({ oracleRequired: oraclesRequired, ratePluginType, rateAccounts, setRateAccounts }: OraclesPickerInput) => {
	// improve safety on accessing rateAccounts

	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker
					rateLabel={'Oracle #1'}
					options={getOracles()}
					pubkey={rateAccounts[0]}
					setRatePlugin={(newType, newPubkey) => {
						setRateAccounts(newType, [newPubkey, rateAccounts[1]]);
					}}
				/>

				{oraclesRequired === 'double' && (
					<OraclePicker
						rateLabel={'Oracle #2'}
						options={getOraclesByType(ratePluginType)}
						pubkey={rateAccounts[1]}
						setRatePlugin={(newType, newPubkey) => {
							setRateAccounts(newType, [newPubkey, rateAccounts[1]]);
						}}
					/>
				)}
			</Stack>
		</Box>
	);
};

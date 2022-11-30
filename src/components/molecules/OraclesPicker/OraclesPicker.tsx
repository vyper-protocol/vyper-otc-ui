import { useEffect, useState } from 'react';

import { Box, Stack, Autocomplete, TextField, Typography, Alert } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import _ from 'lodash';
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

async function getOracleDetail(connection: Connection, cluster: Cluster, pubkey: string): Promise<[OracleDetail, boolean]> {
	try {
		const localData = getOracleByPubkey(pubkey);
		if (localData) return [localData, false];

		const publicKey = new PublicKey(pubkey);

		const [productData] = await RatePythState.GetProductPrice(connection, cluster, publicKey);
		if (productData) {
			return [
				{
					type: 'pyth',
					title: productData.symbol,
					cluster,
					explorerUrl: getRateExplorer('pyth'),
					pubkey
				},
				true
			];
		}

		const aggregatorData = await RateSwitchboardState.LoadAggregatorData(connection, publicKey);
		if (aggregatorData) {
			return [
				{
					type: 'switchboard',
					title: String.fromCharCode(...aggregatorData.name),
					cluster,
					explorerUrl: getRateExplorer('switchboard'),
					pubkey
				},
				true
			];
		}

		return undefined;
	} catch {
		return undefined;
	}
}

const OraclePicker = ({ rateLabel: renderInputTitle, options, pubkey, setRatePlugin }: OraclePickerInput) => {
	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();

	const [isLoading, setIsLoading] = useState(false);

	const [isExternal, setIsExternal] = useState(false);
	const [oracleDetail, setOracleDetail] = useState<OracleDetail>(getOracleByPubkey(pubkey));
	useEffect(() => {
		setIsLoading(true);
		getOracleDetail(connection, currentCluster, pubkey)
			.then((v) => {
				setOracleDetail(v[0]);
				setIsExternal(v[1]);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [connection, currentCluster, pubkey]);

	const [label, setLabel] = useState(<></>);

	return (
		<Stack direction="row" alignItems="center">
			<Autocomplete
				sx={{ width: 300, marginY: 2 }}
				autoHighlight
				selectOnFocus
				clearOnBlur
				handleHomeEndKeys
				disableClearable
				loading={isLoading}
				options={options}
				freeSolo={currentCluster === 'devnet'}
				value={oracleDetail}
				onChange={async (e, val: OracleDetail | string) => {
					if (typeof val === 'object') {
						setRatePlugin((val as OracleDetail).type, (val as OracleDetail).pubkey);
						setLabel(<></>);
					}
				}}
				// inputValue={oracleDetail?.title}
				onInputChange={async (e, val: string, reason: string) => {
					if (reason !== 'input') return;

					setIsLoading(true);
					try {
						const [res, newIsExternal] = await getOracleDetail(connection, currentCluster, val);

						if (res) {
							setOracleDetail(res);
							setIsExternal(newIsExternal);

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
				// getOptionLabel={(oracle: string | OracleDetail) => (typeof oracle === 'string' ? oracle : oracle.title)}
				getOptionLabel={(oracle: OracleDetail) => (isLoading ? 'Loading...' : isExternal ? oracle.pubkey : oracle.title)}
				renderOption={(props, option: OracleDetail) => (
					<Box component="li" {...props}>
						<Typography align="left">{option.title}</Typography>
						<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
							{option.type.toUpperCase()}
						</Typography>
					</Box>
				)}
				renderInput={(params) => (
					<>
						<TextField {...params} label={renderInputTitle} />
						{label}
					</>
				)}
			/>
			{oracleDetail?.explorerUrl && (
				<a href={oracleDetail?.explorerUrl ?? '#'} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>View in explorer</Typography>
				</a>
			)}
		</Stack>
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
					options={_.sortBy(getOracles(), ['title'], ['asc'])}
					pubkey={rateAccounts[0]}
					setRatePlugin={(newType, newPubkey) => {
						const n = _.clone(rateAccounts);
						n.splice(0, 1, newPubkey);
						setRateAccounts(newType, n);
					}}
				/>

				{oraclesRequired === 'double' && (
					<OraclePicker
						rateLabel={'Oracle #2'}
						options={_.sortBy(getOraclesByType(ratePluginType), ['title'], ['asc'])}
						pubkey={rateAccounts[1]}
						setRatePlugin={(newType, newPubkey) => {
							const n = _.clone(rateAccounts);
							n.splice(1, 1, newPubkey);
							setRateAccounts(newType, n);
						}}
					/>
				)}
			</Stack>
		</Box>
	);
};

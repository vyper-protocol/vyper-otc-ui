import { useEffect, useState } from 'react';

import { Box, Stack, Autocomplete, TextField, Typography, CircularProgress } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import MessageAlert from 'components/atoms/MessageAlert';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import _ from 'lodash';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { getOracleByPubkey, getOracles, getOraclesByType, getOraclesByTitle } from 'utils/oracleDatasetHelper';
import { getRateExplorer } from 'utils/oraclesExplorerHelper';

type OraclePickerInput = {
	// label of the oracle
	rateLabel: string;

	// rates allowed
	options: OracleDetail[];

	// rate account pubkey
	oracleDetail: OracleDetail;

	// set callback, sets the rate
	setOracleDetail: (oracle: OracleDetail) => void;

	rateError: boolean;

	setRateError: (error: boolean) => void;
};

async function getOracleDetail(connection: Connection, cluster: Cluster, pubkey: PublicKey): Promise<OracleDetail> {
	const [productData] = await RatePythState.GetProductPrice(connection, cluster, pubkey);
	if (productData) {
		return {
			type: 'pyth',
			title: productData.symbol,
			cluster,
			explorerUrl: getRateExplorer('pyth'),
			pubkey: pubkey.toBase58()
		};
	}

	const aggregatorData = await RateSwitchboardState.LoadAggregatorData(connection, pubkey);
	if (aggregatorData) {
		return {
			type: 'switchboard',
			title: String.fromCharCode(...aggregatorData.name),
			cluster,
			explorerUrl: getRateExplorer('switchboard'),
			pubkey: pubkey.toBase58()
		};
	}

	return undefined;
}

const OraclePicker = ({ rateLabel: renderInputTitle, options, oracleDetail, setOracleDetail, rateError, setRateError }: OraclePickerInput) => {
	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();

	const [value, setValue] = useState(oracleDetail.title);
	const [isLoading, setIsLoading] = useState(false);
	const [isExternal, setIsExternal] = useState(false);

	const handleInputChange = async (input: string) => {
		setIsLoading(true);

		const rate = getOracleByPubkey(input) || getOraclesByTitle(input, 'pyth') || getOraclesByTitle(input, 'switchboard');

		if (rate) {
			// pubkey is in mapped list
			setOracleDetail(rate);
			setValue(rate.title);
			setRateError(false);
			setIsExternal(false);
		} else {
			// pubkey isn't mapped, look for it on chain
			setValue(input);
			let pubkey: PublicKey;
			try {
				pubkey = new PublicKey(input);
				const oracleInfo = await getOracleDetail(connection, currentCluster, pubkey);
				if (oracleInfo) {
					// oracle found on-chain
					setOracleDetail(oracleInfo);
					setRateError(false);
					setIsExternal(true);
				} else {
					// unknown oracle, throw error
					setRateError(true);
					setIsExternal(false);
				}
			} catch (err) {
				// fetch failed or string is not a pubkey, throw error
				setRateError(true);
				setIsExternal(false);
			}
		}
		setIsLoading(false);
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Autocomplete
					disabled={isLoading}
					sx={{ width: 300, marginY: 2 }}
					disableClearable
					autoHighlight
					selectOnFocus
					clearOnBlur
					handleHomeEndKeys
					freeSolo={currentCluster === 'devnet'}
					value={value}
					onInputChange={async (e, input: string, reason: string) => {
						if (reason !== 'input') return;
						if (currentCluster === 'devnet') {
							await handleInputChange(input);
						}
					}}
					options={options}
					getOptionLabel={(oracleOrPubkey: OracleDetail | string) => {
						if (typeof oracleOrPubkey === 'object') {
							return oracleOrPubkey.title;
						} else {
							return oracleOrPubkey;
						}
					}}
					onChange={async (e, oracleOrPubkey: OracleDetail | string) => {
						if (typeof oracleOrPubkey === 'object') {
							handleInputChange(oracleOrPubkey.title);
						} else {
							await handleInputChange(oracleOrPubkey);
						}
					}}
					renderOption={(props, option: OracleDetail) => (
						<Box component="li" {...props}>
							<Typography align="left">{option.title}</Typography>
							<Typography sx={{ color: 'grey', ml: 0.8, fontSize: '0.7em' }} align="right">
								{option.type.toUpperCase()}
							</Typography>
						</Box>
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label={renderInputTitle}
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<div>
										{isLoading ? <CircularProgress color="inherit" size={20} /> : null}
										{params.InputProps.endAdornment}
									</div>
								)
							}}
						/>
					)}
				/>
				{/* TODO: abstract Link component and disable it on rateError */}
				<a href={oracleDetail.explorerUrl} target="_blank" rel="noopener noreferrer">
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>View in explorer</Typography>
				</a>
			</Box>
			{rateError && (
				<div>
					<MessageAlert message={'Oracle provided is invalid'} severity={'error'} />
				</div>
			)}
			{isExternal && (
				<div>
					<MessageAlert message={'Found external oracle: '} severity={'info'}>
						{oracleDetail?.title}
					</MessageAlert>
					<MessageAlert message={'Please use extra care when using external oracles.'} severity={'info'} />
				</div>
			)}
		</Box>
	);
};

export type OraclesPickerInput = {
	oracleRequired: 'single' | 'double';
	ratePluginType: RatePluginTypeIds;
	rateAccounts: string[];
	setRateAccounts: (newType: RatePluginTypeIds, newVal: string[]) => void;
	payoffId: RLPluginTypeIds;
	setOracleError: (error: boolean) => void;
};

// TODO: Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({
	oracleRequired: oraclesRequired,
	ratePluginType,
	rateAccounts,
	setRateAccounts,
	payoffId,
	setOracleError
}: OraclesPickerInput) => {
	// improve safety on accessing rateAccounts

	const [ratesError, setRatesError] = useState([false, false]);

	const [firstOracleDetail, setFirstOracleDetail] = useState(getOracleByPubkey(rateAccounts[0]));
	const [secondOracleDetail, setSecondtOracleDetail] = useState(getOracleByPubkey(rateAccounts[1]));

	// TODO: move the payoff check upstream, tricky since as of now we pass only the pubkeys and a single oracle type
	// TODO: separate error for invalid input vs error for invalid oracle types
	useEffect(() => {
		if (ratesError.some((v) => v) || (payoffId === 'settled_forward' && firstOracleDetail.type !== secondOracleDetail.type)) {
			setOracleError(true);
		} else {
			setOracleError(false);
		}
	});

	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker
					key="oracle_1"
					rateLabel={'Oracle #1'}
					options={_.sortBy(getOracles(), ['title'], ['asc'])}
					oracleDetail={firstOracleDetail}
					setOracleDetail={(oracle) => {
						setFirstOracleDetail(oracle);
						const n = _.clone(rateAccounts);
						n.splice(0, 1, oracle.pubkey);
						setRateAccounts(oracle.type, n);
					}}
					rateError={ratesError[0]}
					setRateError={(newError) => setRatesError([newError, ratesError[1]])}
				/>

				{oraclesRequired === 'double' && (
					<OraclePicker
						key="oracle_2"
						rateLabel={'Oracle #2'}
						options={_.sortBy(getOraclesByType(ratePluginType), ['title'], ['asc'])}
						oracleDetail={secondOracleDetail}
						setOracleDetail={(oracle) => {
							setSecondtOracleDetail(oracle);
							const n = _.clone(rateAccounts);
							n.splice(1, 1, oracle.pubkey);
							setRateAccounts(oracle.type, n);
						}}
						rateError={ratesError[1]}
						setRateError={(newError) => setRatesError([ratesError[0], newError])}
					/>
				)}
			</Stack>
		</Box>
	);
};

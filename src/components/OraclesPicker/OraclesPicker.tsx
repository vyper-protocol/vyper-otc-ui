import { useEffect, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import MessageAlert from 'components/MessageAlert';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import _ from 'lodash';
import { RateTypeIds } from 'models/common';
import { OracleDetail } from 'models/OracleDetail';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { getOracleByPubkey, getOracles, getOraclesByTitle } from 'utils/oracleDatasetHelper';
import { getRateExplorer } from 'utils/oraclesExplorerHelper';

import { PublicKeyPicker } from '../PublicKeyPicker';

type OraclePickerInput = {
	// label of the oracle
	rateLabel: string;

	// rates allowed
	options: OracleDetail[];

	// rate account pubkey
	rateAccount: string;

	// set callback, sets the rate
	setRateAccount: (newPubkey: string, newType: RateTypeIds) => void;

	rateError: boolean;

	setRateError: (error: boolean) => void;
};

const OraclePicker = ({ rateLabel: renderInputTitle, options, rateAccount, setRateAccount, rateError, setRateError }: OraclePickerInput) => {
	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();

	const [oracleDetail, setOracleDetail] = useState(getOracleByPubkey(rateAccount));
	const [value, setValue] = useState('');
	const [isExternal, setIsExternal] = useState(false);

	const handleOracleDetail = (oracle: OracleDetail) => {
		setRateAccount(oracle.pubkey, oracle.type);
		setOracleDetail(oracle);
	};

	// needed in case change is not triggered by input, e.g. when loading a template
	useEffect(() => {
		const rate = getOracleByPubkey(rateAccount) || getOraclesByTitle(rateAccount, 'pyth') || getOraclesByTitle(rateAccount, 'switchboard');

		if (rate) {
			setValue(rate.title);
		}
	}, [rateAccount]);

	const handleInputChange = async (input: string) => {
		const rate = getOracleByPubkey(input) || getOraclesByTitle(input, 'pyth') || getOraclesByTitle(input, 'switchboard');

		if (rate) {
			// pubkey is in mapped list
			handleOracleDetail(rate);
			setRateError(false);
			setIsExternal(false);
		} else {
			// pubkey isn't mapped, look for it on chain
			let pubkey: PublicKey;
			setValue(input);
			try {
				pubkey = new PublicKey(input);
				let oracleInfo: OracleDetail;

				const [productData] = await RatePythState.GetProductPrice(connection, currentCluster, pubkey);
				if (productData) {
					oracleInfo = {
						type: 'pyth',
						title: productData.symbol,
						cluster: currentCluster,
						explorerUrl: getRateExplorer('pyth'),
						pubkey: pubkey.toBase58()
					};
				} else {
					const aggregatorData = await RateSwitchboardState.LoadAggregatorData(connection, pubkey);
					if (aggregatorData) {
						oracleInfo = {
							type: 'switchboard',
							title: String.fromCharCode(...aggregatorData.name),
							cluster: currentCluster,
							explorerUrl: getRateExplorer('switchboard'),
							pubkey: pubkey.toBase58()
						};
					}
				}

				if (oracleInfo) {
					// oracle found on-chain
					handleOracleDetail(oracleInfo);
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
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<PublicKeyPicker
					title={renderInputTitle}
					availableOptions={options.map((o) => ({
						label: o.title,
						pubkey: o.pubkey,
						category: o.category,
						type: o.type
					}))}
					onChange={handleInputChange}
					freeSolo={currentCluster === 'devnet'}
					value={value}
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
					<MessageAlert message={'Please use extra care when using external oracles'} severity={'info'} />
				</div>
			)}
		</Box>
	);
};

export type OraclesPickerInput = {
	// oracleRequired: 'single' | 'double';
	// ratePluginType: RateTypeIds;
	rateAccounts: string[];
	setRateAccounts: (newType: RateTypeIds, newVal: string[]) => void;
	oracleError: boolean;
	setOracleError: (error: boolean) => void;
};

// TODO: Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({ rateAccounts, setRateAccounts, oracleError, setOracleError }: OraclesPickerInput) => {
	// improve safety on accessing rateAccounts

	// const [ratesError, setRatesError] = useState([false, false]);

	// TODO: move the payoff check upstream, tricky since as of now we pass only the pubkeys and a single oracle type
	// TODO: separate error for invalid input vs error for invalid oracle types

	// useEffect(() => {
	// 	if (ratesError.some((v) => v) || (payoffId === 'settled_forward' && firstOracleDetail.type !== secondOracleDetail.type)) {
	// 		setOracleError(true);
	// 	} else {
	// 		setOracleError(false);
	// 	}
	// });

	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker
					key="oracle_1"
					rateLabel={'Oracle #1'}
					options={_.sortBy(getOracles(), ['title'], ['asc'])}
					rateAccount={rateAccounts[0]}
					setRateAccount={(newPubkey, newType) => {
						const n = _.clone(rateAccounts);
						n.splice(0, 1, newPubkey);
						setRateAccounts(newType, n);
					}}
					rateError={oracleError}
					setRateError={setOracleError}
				/>

				{/* {oraclesRequired === 'double' && (
					<OraclePicker
						key="oracle_2"
						rateLabel={'Oracle #2'}
						options={_.sortBy(getOraclesByType(ratePluginType), ['title'], ['asc'])}
						rateAccount={rateAccounts[1]}
						setRateAccount={(newPubkey, newType) => {
							const n = _.clone(rateAccounts);
							n.splice(1, 1, newPubkey);
							setRateAccounts(newType, n);
						}}
						rateError={ratesError[1]}
						setRateError={(newError) => setRatesError([ratesError[0], newError])}
					/>
				)} */}
			</Stack>
		</Box>
	);
};

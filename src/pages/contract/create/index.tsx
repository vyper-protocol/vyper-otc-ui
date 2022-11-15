/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { FormControlLabel, FormGroup, Switch, Button, Box, TextField, Select, InputAdornment, ButtonGroup, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { HiOutlineRefresh } from 'react-icons/hi';
import { GrShare } from 'react-icons/gr';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAggregatorLatestValue, getAggregatorName } from 'api/switchboard/switchboardHelper';
import AmountPicker from 'components/molecules/AmountPicker';
import DateTimePickerComp from 'components/molecules/DateTimePickerComp';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { AVAILABLE_RATE_PLUGINS, AVAILABLE_REDEEM_LOGIC_PLUGINS, RatePluginTypeIds, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { RatePythPlugin } from 'models/plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from 'models/plugins/rate/RateSwitchboardPlugin';
import moment from 'moment';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

const StrikePicker = ({
	title,
	value,
	onChange,
	onRefreshClick
}: {
	title: string;
	value: number;
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;
	onRefreshClick: () => void;
}) => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", margin: "12px" }}>
			<TextField
				label={title}
				variant="outlined"
				type="number"
				size="small"
				value={value}
				onChange={(e) => {
					return onChange(parseInt(e.target.value));
				}}
				InputProps={{ endAdornment: <InputAdornment position="end">
					<ButtonGroup variant='text'>
						<Button onClick={onRefreshClick}>
							<HiOutlineRefresh />
						</Button>
						<Button
							onClick={() => {
								return onChange(value * 2);
							}}
						>
							* 2
						</Button>
						<Button
							onClick={() => {
								return onChange(value / 2);
							}}
						>
							/ 2
						</Button>
					</ButtonGroup>
				</InputAdornment> }}
			/>
		</Box>
	);
};

// eslint-disable-next-line no-unused-vars
const SwitchboardAggregatorPicker = ({ title, value, onChange }: { title: string; value: string; onChange: (val: string) => void }) => {
	const [aggregatorName, setAggregatorName] = useState('');
	const { connection } = useConnection();

	useEffect(() => {
		const fetchData = async () => {
			const n = await getAggregatorName(connection, new PublicKey(value));
			setAggregatorName(n);
		};
		fetchData();
	}, [value, connection]);

	return (
		<Box sx={{ display: "flex", alignItems: "center", margin: "6px" }}>
			<TextField
				sx={{ width: "100%" }}
				label={title + ' ' + aggregatorName}
				variant="outlined"
				size="small"
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<a target="_blank" href="https://switchboard.xyz/explorer" rel="noopener noreferrer">
				<Button variant="text" size="small">
					<GrShare />
				</Button>
			</a>
		</Box>
	);
};

const PublicKeyPicker = ({
	title,
	value,
	onChange,
	hints
}: {
	title: string;
	value: string;
	// eslint-disable-next-line no-unused-vars
	onChange: (val: string) => void;
	hints: { pubkey: string; label: string }[];
}) => {
	return (
		<Box sx={{ display: "flex", alignItems: "center", margin: "6px" }}>
			<TextField
				sx={{ width: "100%" }}
				label={title}
				variant="outlined"
				size="small"
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<Select
				sx={{ width: "100%", margin: "12px" }}
				value={value}
				size="small"
				onChange={event => onChange(event.target.value)}
			>
				{
					hints.map(hint =>
						<MenuItem key={hint.pubkey} value={hint.pubkey}>{hint.label}</MenuItem>
					)
				}
			</Select>

			{/* {hints.map((c) => (
				<Button
					key={c.pubkey}
					onClick={() => {
						return onChange(c.pubkey);
					}}
				>
					{c.label}
				</Button>
			))} */}
		</Box>
	);
};

// eslint-disable-next-line no-unused-vars
const PythPricePicker = ({ title, value, onChange }: { title: string; value: string; onChange: (_: string) => void }) => {
	const [productSymbol, setProductSymbol] = useState('');
	const { connection } = useConnection();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [product] = await RatePythPlugin.GetProductPrice(connection, getCurrentCluster(), new PublicKey(value));
				if (product) setProductSymbol(product?.symbol ?? '');
				else setProductSymbol('');
			} catch {
				setProductSymbol('');
			}
		};
		fetchData();
	}, [value, connection]);

	return (
		<Box sx={{ display: "flex", alignItems: "center", margin: "6px" }}>
			<TextField
				sx={{ width: "100%" }}
				label={title + ' ' + productSymbol}
				variant="outlined"
				size="small"
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<a target="_blank" href="https://pyth.network/price-feeds" rel="noopener noreferrer">
				<Button variant="text" size="small">
					<GrShare />
				</Button>
			</a>
		</Box>
	);
};

const CreateContractPage = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);
	const [saveOnDatabase, setSaveOnDatabase] = useState(true);
	const [sendNotification, setSendNotification] = useState(true);

	const reserveMintHints = [
		{
			pubkey: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
			label: 'mainnet USDC'
		},
		{
			pubkey: '11111111111111111111111111111111',
			label: 'mainnet SOL'
		},
		{
			pubkey: 'So11111111111111111111111111111111111111112',
			label: 'mainnet wSOL'
		},
		{
			pubkey: '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W',
			label: 'devnet test tokens'
		}
	];
	const [reserveMint, setReserveMint] = useState(reserveMintHints[0].pubkey);

	const [depositStart, setDepositStart] = useState(moment().add(0, 'minutes').toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(moment().add(5, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(moment().add(15, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(100);

	const [ratePluginType, setRatePluginType] = useState<RatePluginTypeIds>('pyth');

	const [redeemLogicPluginType, setRedeemLogicPluginType] = useState<RedeemLogicPluginTypeIds>('forward');

	const [switchboardAggregator_1, setSwitchboardAggregator_1] = useState('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');
	const [switchboardAggregator_2, setSwitchboardAggregator_2] = useState('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');
	const [pythPrice_1, setPythPrice_1] = useState('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');
	const [pythPrice_2, setPythPrice_2] = useState('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

	const setStrikeToDefaultValue = async () => {
		try {
			if (ratePluginType === 'pyth') {
				const [, price] = await RatePythPlugin.GetProductPrice(connection, getCurrentCluster(), new PublicKey(pythPrice_1));
				setStrike(price?.price ?? 0);
			}
			if (ratePluginType === 'switchboard') {
				const [, price] = await RateSwitchboardPlugin.LoadAggregatorData(connection, new PublicKey(switchboardAggregator_1));
				setStrike(price ?? 0);
			}
		} catch {
			setStrike(0);
		}
	};

	useEffect(() => {
		setStrikeToDefaultValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ratePluginType, switchboardAggregator_1, pythPrice_1]);

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);
	const [isCall, setIsCall] = useState(true);

	useEffect(() => {
		getAggregatorLatestValue(provider.connection, new PublicKey(switchboardAggregator_1))
			.then((v) => {
				return setStrike(v);
			})
			.catch(() => {
				return setStrike(0);
			});
	}, [provider.connection, switchboardAggregator_1]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const rateAccounts: PublicKey[] = [];
			if (ratePluginType === 'switchboard') {
				rateAccounts.push(new PublicKey(switchboardAggregator_1));
				rateAccounts.push(new PublicKey(switchboardAggregator_2));
			}
			if (ratePluginType === 'pyth') {
				rateAccounts.push(new PublicKey(pythPrice_1));
				rateAccounts.push(new PublicKey(pythPrice_2));
			}

			let redeemLogicOption: OtcInitializationParams['redeemLogicOption'];

			if (redeemLogicPluginType === 'forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike
				};
			} else if (redeemLogicPluginType === 'settled_forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike,
					isStandard: false
				};
			} else if (redeemLogicPluginType === 'digital') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					isCall
				};
			} else if (redeemLogicPluginType === 'vanilla_option') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					notional,
					isCall,
					isLinear: true
				};
			} else {
				throw Error('redeem logic plugin not supported: ' + redeemLogicPluginType);
			}

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey(reserveMint),
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount,
				juniorDepositAmount,
				rateOption: {
					ratePluginType,
					rateAccounts
				},
				redeemLogicOption,
				saveOnDatabase,
				sendNotification
			};

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams);

			// Create contract URL
			router.push(UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58()));
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<Box>
				<b>Redeem Logic</b>

				<Select
					sx={{ width: "100%", margin: "12px" }}
					value={redeemLogicPluginType}
					size="small"
					onChange={event => setRedeemLogicPluginType(event.target.value as RedeemLogicPluginTypeIds)}
				>
					{
						AVAILABLE_REDEEM_LOGIC_PLUGINS.map(plugin =>
							<MenuItem key={plugin} value={plugin}>{plugin}</MenuItem>
						)
					}
				</Select>

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<StrikePicker title="Strike" value={strike} onChange={setStrike} onRefreshClick={setStrikeToDefaultValue} />
					{(redeemLogicPluginType === 'forward' || redeemLogicPluginType === 'settled_forward' || redeemLogicPluginType === 'vanilla_option') && (
						<AmountPicker title="Notional" value={notional} onChange={setNotional} />
					)}
					{(redeemLogicPluginType === 'digital' || redeemLogicPluginType === 'vanilla_option') && (
						<FormGroup>
							<FormControlLabel
								control={<Switch defaultChecked checked={isCall} onChange={(e) => setIsCall(e.target.checked)} />}
								label={isCall ? 'Call' : 'Put'}
							/>
						</FormGroup>
					)}
				</Box>

				<hr />

				<b>Rate Plugin</b>

				<Select
					sx={{ width: "100%", margin: "12px" }}
					value={ratePluginType}
					size="small"
					onChange={event => setRatePluginType(event.target.value as RatePluginTypeIds)}>
						{
							AVAILABLE_RATE_PLUGINS.map(plugin =>
								<MenuItem key={plugin} value={plugin}>{plugin}</MenuItem>
							)
						}
				</Select>

				{ratePluginType === 'switchboard' && (
					<>
						<SwitchboardAggregatorPicker title="Switchboard Aggregator #1" value={switchboardAggregator_1} onChange={setSwitchboardAggregator_1} />
						{redeemLogicPluginType === 'settled_forward' && (
							<SwitchboardAggregatorPicker title="Switchboard Aggregator #2" value={switchboardAggregator_2} onChange={setSwitchboardAggregator_2} />
						)}
					</>
				)}
				{ratePluginType === 'pyth' && (
					<>
						<PythPricePicker title="Pyth Price #1" value={pythPrice_1} onChange={setPythPrice_1} />
						{redeemLogicPluginType === 'settled_forward' && <PythPricePicker title="Pyth Price #2" value={pythPrice_2} onChange={setPythPrice_2} />}
					</>
				)}

				<hr />

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<AmountPicker title="Long amount" value={seniorDepositAmount} onChange={setSeniorDepositAmount} />
					<AmountPicker title="Short amount" value={juniorDepositAmount} onChange={setJuniorDepositAmount} />
				</Box>

				<hr />

				<Box sx={{ display: "flex", alignItems: "center" }}>
					<PublicKeyPicker title="Reserve Mint" value={reserveMint} onChange={setReserveMint} hints={reserveMintHints} />
				</Box>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<DateTimePickerComp title="Deposit Start" value={depositStart} onChange={setDepositStart} />
					<DateTimePickerComp title="Deposit End" value={depositEnd} onChange={setDepositEnd} />
					<DateTimePickerComp title="Settle Start" value={settleStart} onChange={setSettleStart} />
				</Box>

				{process.env.NODE_ENV === 'development' && (
					<FormGroup>
						<FormControlLabel
							control={<Switch checked={saveOnDatabase} onChange={(e) => setSaveOnDatabase(e.target.checked)} />}
							label="Save on database"
						/>
						<FormControlLabel
							control={<Switch checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />}
							label="Send notification"
						/>
					</FormGroup>
				)}

				<LoadingButton variant="contained" loading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					Create Contract
				</LoadingButton>
			</Box>
		</Layout>
	);
};

export default CreateContractPage;

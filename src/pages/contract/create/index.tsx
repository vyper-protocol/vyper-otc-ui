/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAggregatorLatestValue, getAggregatorName } from 'api/switchboard/switchboardHelper';
import AmountPicker from 'components/molecules/AmountPicker';
import DateTimePickerComp from 'components/molecules/DateTimePickerComp';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { Button, Combobox, IconButton, Pane, RefreshIcon, ShareIcon, TextInputField } from 'evergreen-ui';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import RateSwitchboardState from 'models/plugins/rate/RateSwitchboardState';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getClusterFromRpcEndpoint } from 'utils/clusterHelpers';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';

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
		<Pane display="flex" alignItems="center" margin={12}>
			<TextInputField
				label={title}
				type="number"
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<IconButton icon={RefreshIcon} onClick={onRefreshClick} intent="success" />
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
		</Pane>
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
		<Pane display="flex" alignItems="center" margin={6}>
			<TextInputField
				width="100%"
				label={title + ' ' + aggregatorName}
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<a target="_blank" href="https://switchboard.xyz/explorer" rel="noopener noreferrer">
				<IconButton icon={ShareIcon} intent="success" />
			</a>
		</Pane>
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
	onChange: (val: string) => void;
	hints: { pubkey: string; label: string }[];
}) => {
	return (
		<Pane display="flex" width="100%" alignItems="center" margin={6}>
			<TextInputField
				width="100%"
				label={title}
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<Combobox
				items={hints}
				itemToString={(item) => (item ? item.label : '')}
				initialSelectedItem={hints.find((c) => c.pubkey)?.label}
				onChange={(selected) => onChange(selected.pubkey)}
			/>

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
		</Pane>
	);
};

// eslint-disable-next-line no-unused-vars
const PythPricePicker = ({ title, value, onChange }: { title: string; value: string; onChange: (_: string) => void }) => {
	const [productSymbol, setProductSymbol] = useState('');
	const { connection } = useConnection();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [product] = await RatePythState.GetProductPrice(connection, getClusterFromRpcEndpoint(connection.rpcEndpoint), new PublicKey(value));
				if (product) setProductSymbol(product?.symbol ?? '');
				else setProductSymbol('');
			} catch {
				setProductSymbol('');
			}
		};
		fetchData();
	}, [value, connection]);

	return (
		<Pane display="flex" alignItems="center" margin={6}>
			<TextInputField
				width="100%"
				label={title + ' ' + productSymbol}
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<a target="_blank" href="https://pyth.network/price-feeds" rel="noopener noreferrer">
				<IconButton icon={ShareIcon} intent="success" />
			</a>
		</Pane>
	);
};

const CreateContractPage = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);
	const urlProvider = useContext(UrlProviderContext);

	const [isLoading, setIsLoading] = useState(false);
	const [saveOnDatabase, setSaveOnDatabase] = useState(true);
	const [sendNotification, setSendNotification] = useState(false);

	const reserveMintHints = [
		{
			pubkey: 'F12Jiu1sp6J1TCQsdy5kWaQkfbaxWvp6YvCJvtoYLXEo',
			label: 'mainnet test tokens'
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
	const availableRatePluginTypes: RatePluginTypeIds[] = ['switchboard', 'pyth'];

	const [switchboardAggregator, setSwitchboardAggregator] = useState('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');
	const [pythPrice, setPythPrice] = useState('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

	const setStrikeToDefaultValue = async () => {
		if (ratePluginType === 'pyth') {
			const [, price] = await RatePythState.GetProductPrice(connection, getClusterFromRpcEndpoint(connection.rpcEndpoint), new PublicKey(pythPrice));
			setStrike(price?.price ?? 0);
		}
		if (ratePluginType === 'switchboard') {
			const [, price] = await RateSwitchboardState.LoadAggregatorData(connection, new PublicKey(switchboardAggregator));
			setStrike(price ?? 0);
		}
	};

	useEffect(() => {
		setStrikeToDefaultValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ratePluginType, switchboardAggregator, pythPrice]);

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);

	useEffect(() => {
		getAggregatorLatestValue(provider.connection, new PublicKey(switchboardAggregator))
			.then((v) => {
				return setStrike(v);
			})
			.catch(() => {
				return setStrike(0);
			});
	}, [provider.connection, switchboardAggregator]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			let rateAccount = PublicKey.unique();
			if (ratePluginType === 'switchboard') rateAccount = new PublicKey(switchboardAggregator);
			if (ratePluginType === 'pyth') rateAccount = new PublicKey(pythPrice);

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey(reserveMint),
				depositStart: depositStart,
				depositEnd: depositEnd,
				settleStart: settleStart,
				seniorDepositAmount,
				juniorDepositAmount,
				rateOption: {
					ratePluginType,
					rateAccount
				},
				redeemLogicOption: {
					isLinear: true,
					notional,
					strike
				},
				saveOnDatabase: saveOnDatabase,
				sendNotification: sendNotification
			};

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams);

			// Create contract URL
			router.push(urlProvider.buildContractSummaryUrl(otcPublicKey.toBase58()));
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<Pane>
				<Pane display="flex" alignItems="center">
					<PublicKeyPicker title="Reserve Mint" value={reserveMint} onChange={setReserveMint} hints={reserveMintHints} />
				</Pane>
				<Pane display="flex" alignItems="center">
					<DateTimePickerComp title="Deposit Start" value={depositStart} onChange={setDepositStart} />
					<DateTimePickerComp title="Deposit End" value={depositEnd} onChange={setDepositEnd} />
					<DateTimePickerComp title="Settle Start" value={settleStart} onChange={setSettleStart} />
				</Pane>

				<Pane display="flex" alignItems="center">
					<AmountPicker title="Side A amount" value={seniorDepositAmount} onChange={setSeniorDepositAmount} />
					<AmountPicker title="Side B amount" value={juniorDepositAmount} onChange={setJuniorDepositAmount} />
				</Pane>

				<Combobox initialSelectedItem={ratePluginType} items={availableRatePluginTypes} onChange={setRatePluginType} />

				{ratePluginType === 'switchboard' && (
					<SwitchboardAggregatorPicker title="Switchboard Aggregator" value={switchboardAggregator} onChange={setSwitchboardAggregator} />
				)}
				{ratePluginType === 'pyth' && <PythPricePicker title="Pyth Price" value={pythPrice} onChange={setPythPrice} />}

				<Pane display="flex" alignItems="center">
					<StrikePicker title="Strike" value={strike} onChange={setStrike} onRefreshClick={setStrikeToDefaultValue} />
					<AmountPicker title="Notional" value={notional} onChange={setNotional} />
				</Pane>

				<FormGroup>
					<FormControlLabel
						control={<Switch defaultChecked checked={saveOnDatabase} onChange={(e) => setSaveOnDatabase(e.target.checked)} />}
						label="Save on database"
					/>
					<FormControlLabel
						control={<Switch defaultChecked checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />}
						label="Send notification"
					/>
				</FormGroup>

				<Button isLoading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					Create Contract
				</Button>
			</Pane>
		</Layout>
	);
};

export default CreateContractPage;

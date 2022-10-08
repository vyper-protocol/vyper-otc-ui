import { useContext, useEffect, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { create } from 'api/otc-state/create';
import { insertContract as supabaseInsertContract } from 'api/supabase/insertContract';
import { getAggregatorLatestValue, getAggregatorName } from 'api/switchboard/switchboardHelper';
import DateTimePickerComp from 'components/molecules/DateTimePickerComp';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { Button, IconButton, Pane, RefreshIcon, ShareIcon, TextInputField } from 'evergreen-ui';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getAggregatorLatestValue, getAggregatorName } from 'api/switchboard/switchboardHelper';

// eslint-disable-next-line no-unused-vars
const AmountPicker = ({ title, value, onChange }: { title: string; value: number; onChange: (_: number) => void }) => {
	return (
		<Pane display="flex" alignItems="center" margin={12}>
			<TextInputField
				label={title}
				type="number"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					return onChange(Number(e.target.value));
				}}
			/>
			<Button
				onClick={() => {
					return onChange(100);
				}}
			>
				reset
			</Button>
			<Button
				onClick={() => {
					return onChange(value + 100);
				}}
			>
				+ 100
			</Button>
			<Button
				onClick={() => {
					return onChange(value - 100);
				}}
			>
				- 100
			</Button>
		</Pane>
	);
};

const StrikePicker = ({
	title,
	value,
	onChange,
	switchboardAggregator
}: {
	title: string;
	value: number;
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;
	switchboardAggregator: string;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const { connection } = useConnection();

	const onRefresh = async () => {
		try {
			setIsLoading(true);
			const latestResult = await getAggregatorLatestValue(connection, new PublicKey(switchboardAggregator));
			onChange(latestResult);
		} catch (err) {
			alert(err);
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

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
			<IconButton
				isLoading={isLoading}
				icon={RefreshIcon}
				onClick={() => {
					return onRefresh();
				}}
				intent="success"
			/>
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

const CreateContractPage = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);
	const urlProvider = useContext(UrlProviderContext);

	const [isLoading, setIsLoading] = useState(false);

	const [depositStart, setDepositStart] = useState(moment().add(0, 'minutes').toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(moment().add(5, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(moment().add(15, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(100);

	const [switchboardAggregator, setSwitchboardAggregator] = useState('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');

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

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W'),
				depositStart: depositStart,
				depositEnd: depositEnd,
				settleStart: settleStart,
				seniorDepositAmount,
				juniorDepositAmount,
				rateOption: {
					switchboardAggregator: new PublicKey(switchboardAggregator)
				},
				redeemLogicOption: {
					isLinear: true,
					notional,
					strike
				}
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
					<DateTimePickerComp title="Deposit Start" value={depositStart} onChange={setDepositStart} />
					<DateTimePickerComp title="Deposit End" value={depositEnd} onChange={setDepositEnd} />
					<DateTimePickerComp title="Settle Start" value={settleStart} onChange={setSettleStart} />
				</Pane>

				<Pane display="flex" alignItems="center">
					<AmountPicker title="Side A amount" value={seniorDepositAmount} onChange={setSeniorDepositAmount} />
					<AmountPicker title="Side B amount" value={juniorDepositAmount} onChange={setJuniorDepositAmount} />
				</Pane>
				<SwitchboardAggregatorPicker title="Switchboard Aggregator" value={switchboardAggregator} onChange={setSwitchboardAggregator} />
				<Pane display="flex" alignItems="center">
					<StrikePicker title="Strike" value={strike} onChange={setStrike} switchboardAggregator={switchboardAggregator} />
					<AmountPicker title="Notional" value={notional} onChange={setNotional} />
				</Pane>

				<Button isLoading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					Create Contract
				</Button>
			</Pane>
		</Layout>
	);
};

export default CreateContractPage;

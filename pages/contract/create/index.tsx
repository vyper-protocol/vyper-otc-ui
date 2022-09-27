import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AggregatorAccount, loadSwitchboardProgram } from '@switchboard-xyz/switchboard-v2';
import { create } from 'api/otc-state/create';
import Layout from 'components/templates/Layout/Layout';
import { Button, IconButton, Pane, RefreshIcon, ShareIcon, TextInputField } from 'evergreen-ui';
import { OtcInitializationParams } from 'models/OtcInitializationParams';
import moment from 'moment';
import { useRouter } from 'next/router';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { useContext, useState } from 'react';

function AmountPicker({ title, value, onChange }: { title: string; value: number; onChange: (_: number) => void }) {
	return (
		<Pane display="flex" alignItems="center" margin={12}>
			<TextInputField label={title} type="number" value={value} onChange={(e) => onChange(e.target.value)} />
			<Button onClick={(e) => onChange(100)}>reset</Button>
			<Button onClick={(e) => onChange(value + 100)}>+ 100</Button>
			<Button onClick={(e) => onChange(value - 100)}>- 100</Button>
		</Pane>
	);
}

function StrikePicker({
	title,
	value,
	onChange,
	switchboardAggregator
}: {
	title: string;
	value: number;
	onChange: (val: number) => void;
	switchboardAggregator: string;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const { connection } = useConnection();

	const onRefresh = async () => {
		try {
			setIsLoading(true);
			const program = await loadSwitchboardProgram('devnet', connection);

			const aggregatorAccount = new AggregatorAccount({
				program,
				publicKey: new PublicKey(switchboardAggregator)
			});

			const latestResult = await aggregatorAccount.getLatestValue();
			onChange(latestResult.toNumber());
		} catch (err) {
			alert(err);
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Pane display="flex" alignItems="center" margin={12}>
			<TextInputField label={title} type="number" value={value} onChange={(e) => onChange(e.target.value)} />
			<IconButton isLoading={isLoading} icon={RefreshIcon} onClick={(e) => onRefresh()} intent="success" />
			<Button onClick={(e) => onChange(value * 2)}>* 2</Button>
			<Button onClick={(e) => onChange(value / 2)}>/ 2</Button>
		</Pane>
	);
}

function TimePicker({ title, value, onChange }: { title: string; value: number; onChange: (val: number) => void }) {
	return (
		<Pane margin={6}>
			<TextInputField label={title} description={moment(value).format()} readOnly value={moment(value).fromNow()} />
			<Pane display="flex" alignItems="center">
				<Button onClick={(e) => onChange(moment().toDate().getTime())}>now</Button>
				<Button onClick={(e) => onChange(moment(value).add(5, 'minutes').toDate().getTime())}>+ 5min</Button>
				<Button onClick={(e) => onChange(moment(value).subtract(5, 'minutes').toDate().getTime())}>- 5min</Button>
			</Pane>
		</Pane>
	);
}

function SwitchboardAggregatorPicker({
	title,
	value,
	onChange
}: {
	title: string;
	value: string;
	onChange: (val: string) => void;
}) {
	return (
		<Pane display="flex" alignItems="center" margin={6}>
			<TextInputField width="100%" label={title} value={value} onChange={(e) => onChange(e.target.value)} />
			<a target="_blank" href="https://switchboard.xyz/explorer" rel="noopener noreferrer">
				<IconButton icon={ShareIcon} intent="success" />
			</a>
		</Pane>
	);
}

export default function CreateContractPage() {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const [depositStart, setDepositStart] = useState(moment().toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(moment().add(20, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(moment().add(40, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(100);

	const [switchboardAggregator, setSwitchboardAggregator] = useState('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);

	const createContract = async () => {
		try {
			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W'),
				depositStart,
				depositEnd,
				settleStart,
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
			console.log('provider: ', provider);
			console.log('initParams: ', initParams);

			const [txs, otcPublicKey] = await create(provider, initParams);
			await txHandler.handleTxs(...txs);
			router.push(`/contract/summary/${otcPublicKey.toBase58()}`);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Layout>
			<Pane>
				<Pane display="flex" alignItems="center">
					<TimePicker title="Deposit Start" value={depositStart} onChange={setDepositStart} />
					<TimePicker title="Deposit End" value={depositEnd} onChange={setDepositEnd} />
					<TimePicker title="Settle Start" value={settleStart} onChange={setSettleStart} />
				</Pane>

				<Pane display="flex" alignItems="center">
					<AmountPicker title="Side A amount" value={seniorDepositAmount} onChange={setSeniorDepositAmount} />
					<AmountPicker title="Side B amount" value={juniorDepositAmount} onChange={setJuniorDepositAmount} />
				</Pane>
				<SwitchboardAggregatorPicker
					title="Switchboard Aggregator"
					value={switchboardAggregator}
					onChange={setSwitchboardAggregator}
				/>
				<Pane display="flex" alignItems="center">
					<StrikePicker
						title="Strike"
						value={strike}
						onChange={setStrike}
						switchboardAggregator={switchboardAggregator}
					/>
					<AmountPicker title="Notional" value={notional} onChange={setNotional} />
				</Pane>

				<Button isLoading={isLoading} onClick={createContract}>
					Create Contract
				</Button>
			</Pane>
		</Layout>
	);
}

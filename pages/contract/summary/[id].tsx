import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claim } from 'api/otc-state/claim';
import { deposit } from 'api/otc-state/deposit';
import { settle } from 'api/otc-state/settle';
import { withdraw } from 'api/otc-state/withdraw';
import SearchBar from 'components/molecules/SearchBar/SearchBar';
import Layout from 'components/templates/Layout/Layout';
import { Pane, Text, Table, Button } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { TxHandlerContext } from 'providers/TxHandlerProvider';

const ReactJson = dynamic(import('react-json-view'), { ssr: false });

export default function SummaryPage() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

	const [searchValue, setSearchValue] = useState('');

	const onDepositSeniorClick = async (e) => {
		try {
			const tx = await deposit(provider, new PublicKey(id), true);
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		rateStateQuery.refetch();
	};
	const onDepositJuniorClick = async () => {
		try {
			const tx = await deposit(provider, new PublicKey(id), false);
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		rateStateQuery.refetch();
	};
	const onWithdrawClick = async () => {
		try {
			const tx = await withdraw(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		rateStateQuery.refetch();
	};
	const onSettleClick = async () => {
		try {
			const tx = await settle(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		rateStateQuery.refetch();
	};
	const onClaimClick = async () => {
		try {
			const tx = await claim(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		rateStateQuery.refetch();
	};

	return (
		<Layout>
			<Pane clearfix margin={24}>
				<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} />
				<Pane justifyContent="center" alignItems="center" flexDirection="column" marginBottom={24}>
					<Text>
						using public key: <code>{id}</code>
					</Text>
				</Pane>
				<Pane justifyContent="center" alignItems="center" flexDirection="column">
					{!rateStateQuery.data && <Text>Fetching</Text>}
					{rateStateQuery.data && (
						<>
							{rateStateQuery.data.isDepositSeniorAvailable && (
								<Button onClick={onDepositSeniorClick} marginRight={16}>
									Deposit Senior
								</Button>
							)}
							{rateStateQuery.data.isDepositJuniorAvailable && (
								<Button onClick={onDepositJuniorClick} marginRight={16}>
									Deposit Junior
								</Button>
							)}
							{rateStateQuery.data.isWithdrawSeniorAvailable && (
								<Button onClick={onWithdrawClick} marginRight={16}>
									Withdraw Senior
								</Button>
							)}
							{rateStateQuery.data.isWithdrawJuniorAvailable && (
								<Button onClick={onWithdrawClick} marginRight={16}>
									Withdraw Junior
								</Button>
							)}
							{rateStateQuery.data.isSettlementAvailable && (
								<Button onClick={onSettleClick} marginRight={16}>
									Settle
								</Button>
							)}
							{rateStateQuery.data.isClaimSeniorAvailable && (
								<Button onClick={onClaimClick} marginRight={16}>
									Claim Senior
								</Button>
							)}
							{rateStateQuery.data.isClaimJuniorAvailable && (
								<Button onClick={onClaimClick} marginRight={16}>
									Claim Junior
								</Button>
							)}
							<Table marginBottom={24}>
								<Table.Body>
									<Table.Row>
										<Table.TextCell>Created</Table.TextCell>
										<Table.TextCell>{moment(rateStateQuery.data.created_sec * 1000).fromNow()}</Table.TextCell>
									</Table.Row>
									<Table.Row>
										<Table.TextCell>Deposit expiration</Table.TextCell>
										<Table.TextCell>
											{moment(rateStateQuery.data.depositExpiration_sec * 1000).fromNow()}
										</Table.TextCell>
									</Table.Row>
									<Table.Row>
										<Table.TextCell>Settle available</Table.TextCell>
										<Table.TextCell>
											{moment(rateStateQuery.data.settleAvailableFrom_sec * 1000).fromNow()}
										</Table.TextCell>
									</Table.Row>

									<Table.Row>
										<Table.TextCell>Aggreator data last value</Table.TextCell>
										<Table.TextCell>{rateStateQuery.data.rateState.aggregatorLastValue}</Table.TextCell>
									</Table.Row>
								</Table.Body>
							</Table>

							<ReactJson collapsed src={rateStateQuery.data} />
						</>
					)}
				</Pane>
			</Pane>
		</Layout>
	);
}

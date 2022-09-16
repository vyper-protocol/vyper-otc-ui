import { useContext } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claim } from 'api/otc-state/claim';
import { deposit } from 'api/otc-state/deposit';
import { settle } from 'api/otc-state/settle';
import { withdraw } from 'api/otc-state/withdraw';
import StatsPanel from 'components/organisms/StatsPanel/StatsPanel';
import Layout from 'components/templates/Layout/Layout';
import { Pane, Button } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
import { useRouter } from 'next/router';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { formatCurrency } from 'utils/numberHelpers';

export default function SummaryPageId() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

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

	// TODO replace mock data with switchboard or chain data
	const contractData = {
		pubkey: id as string,
		asset: 'BTC_CHF',
		stats: [
			{
				name: 'Asset Price',
				value: formatCurrency(19897.56, true)
			},
			{
				name: 'Leverage',
				value: '20x'
			},
			{
				name: 'Collateral',
				value: formatCurrency(39794, true)
			},
			{
				name: 'Duration',
				value: 1663869600
			},
			{
				name: 'Strike',
				value: 19897
			}
		],
		timestamps: {
			createdAt: moment(rateStateQuery?.data?.created_sec * 1000).format('Do MMMM YYYY'),
			depositExpiraton: moment(rateStateQuery?.data?.depositExpiration_sec * 1000).fromNow(),
			settleAvailable: moment(rateStateQuery?.data?.settleAvailableFrom_sec * 1000).fromNow()
		},

		amounts: {
			seniorDepositAmount: rateStateQuery?.data?.seniorDepositAmount,
			juniorDepositAmount: rateStateQuery?.data?.juniorDepositAmount,
			seniorReserveTokens: rateStateQuery?.data?.otcSeniorReserveTokenAccountAmount,
			juniorReserveTokens: rateStateQuery?.data?.otcJuniorReserveTokenAccountAmount
		},
		beneficiaries: {
			seniorAccount: rateStateQuery?.data?.seniorSideBeneficiaryTokenAccount,
			seniorOwner: rateStateQuery?.data?.seniorSideBeneficiaryOwner,
			juniorAccount: rateStateQuery?.data?.juniorSideBeneficiaryTokenAccount,
			juniorOwner: rateStateQuery?.data?.juniorSideBeneficiaryOwner
		},
		states: {
			rateState: rateStateQuery?.data?.rateState,
			redeemLogicState: rateStateQuery?.data?.redeemLogicState
		}
	};

	const loading = !rateStateQuery?.data?.depositExpiration_sec || !rateStateQuery?.data?.settleAvailableFrom_sec;

	return (
		<Layout>
			<Pane clearfix margin={24} maxWidth={400}>
				{/* @ts-ignore */}
				{loading ? <Spinner /> : <StatsPanel contract={contractData} />}

				<>
					{rateStateQuery?.data?.isDepositSeniorAvailable && (
						<Button width="100%" onClick={onDepositSeniorClick} appearance="primary" intent="success">
							Deposit Senior
						</Button>
					)}
					{rateStateQuery?.data?.isDepositJuniorAvailable && (
						<Button width="100%" onClick={onDepositJuniorClick} appearance="primary" intent="danger">
							Deposit Junior
						</Button>
					)}
					{rateStateQuery?.data?.isWithdrawSeniorAvailable && (
						<Button width="100%" onClick={onWithdrawClick} appearance="primary" intent="none">
							Withdraw Senior
						</Button>
					)}
					{rateStateQuery?.data?.isWithdrawJuniorAvailable && (
						<Button width="100%" onClick={onWithdrawClick} appearance="primary" intent="none">
							Withdraw Junior
						</Button>
					)}
					{rateStateQuery?.data?.isSettlementAvailable && (
						<Button width="100%" onClick={onSettleClick} appearance="primary" intent="none">
							Settle
						</Button>
					)}
					{rateStateQuery?.data?.isClaimSeniorAvailable && (
						<Button width="100%" onClick={onClaimClick} appearance="primary" intent="success">
							Claim Senior
						</Button>
					)}
					{rateStateQuery?.data?.isClaimJuniorAvailable && (
						<Button width="100%" onClick={onClaimClick} appearance="primary" intent="success">
							Claim Junior
						</Button>
					)}
				</>
			</Pane>
		</Layout>
	);
}

import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claim } from 'api/otc-state/claim';
import { deposit } from 'api/otc-state/deposit';
import { settle } from 'api/otc-state/settle';
import { withdraw } from 'api/otc-state/withdraw';
import StatsPanel from 'components/organisms/StatsPanel/StatsPanel';
import Layout from 'components/templates/Layout/Layout';
import { Pane, PlusIcon, MinusIcon, ResetIcon, RecordIcon, CleanIcon } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { formatCurrency } from 'utils/numberHelpers';

import ButtonPill from '../../../components/atoms/ButtonPill/ButtonPill';
import styles from './summary.module.scss';

const ReactJson = dynamic(import('react-json-view'), { ssr: false });

// test : WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

export default function SummaryPageId() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

	const [loadingDepositSenior, setLoadingDepositSenior] = useState(false);
	const [loadingDepositJunior, setLoadingDepositJunior] = useState(false);
	const [loadingWithdraw, setLoadingWithdraw] = useState(false);
	const [loadingSettle, setLoadingSettle] = useState(false);
	const [loadingClaim, setLoadingClaim] = useState(false);

	const onDepositSeniorClick = async (e) => {
		try {
			setLoadingDepositSenior(true);
			const tx = await deposit(provider, new PublicKey(id), true);
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		setLoadingDepositSenior(false);
		rateStateQuery.refetch();
	};
	const onDepositJuniorClick = async () => {
		try {
			setLoadingDepositJunior(true);
			const tx = await deposit(provider, new PublicKey(id), false);
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		setLoadingDepositJunior(false);
		rateStateQuery.refetch();
	};
	const onWithdrawClick = async () => {
		try {
			setLoadingWithdraw(true);
			const tx = await withdraw(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		setLoadingWithdraw(false);
		rateStateQuery.refetch();
	};
	const onSettleClick = async () => {
		try {
			setLoadingSettle(true);
			const tx = await settle(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		setLoadingSettle(false);
		rateStateQuery.refetch();
	};
	const onClaimClick = async () => {
		try {
			setLoadingClaim(true);
			const tx = await claim(provider, new PublicKey(id));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		}
		setLoadingClaim(false);
		rateStateQuery.refetch();
	};

	// TODO replace hardcoded mock data with switchboard or chain data
	const contractData = {
		pubkey: id as string,
		asset: 'BTC_TBD',
		stats: [
			{
				name: 'Aggregator value',
				value: formatCurrency(rateStateQuery?.data?.rateState.aggregatorLastValue, true)
			},
			{
				name: 'Duration',
				value: moment
					.duration(rateStateQuery?.data?.settleAvailableFromAt - rateStateQuery?.data?.depositExpirationAt)
					.humanize()
			},
			{
				name: 'Strike',
				value: rateStateQuery?.data?.redeemLogicState.strike.toFixed(4)
			}
		],
		timestamps: [
			{
				name: 'Created at',
				value: moment(rateStateQuery?.data?.createdAt).format('d/M/YY HH:mm::ss')
			},
			{ name: 'Deposit start', value: moment(rateStateQuery?.data?.depositAvailableFrom).format('d/M/YY HH:mm::ss') },
			{ name: 'Deposit expire', value: moment(rateStateQuery?.data?.depositExpirationAt).format('d/M/YY HH:mm::ss') },
			{
				name: 'Settle available',
				value: moment(rateStateQuery?.data?.settleAvailableFromAt).format('d/M/YY HH:mm::ss')
			}
		],
		amounts: {
			seniorDepositAmount: rateStateQuery?.data?.buyerDepositAmount,
			juniorDepositAmount: rateStateQuery?.data?.sellerDepositAmount,
			seniorReserveTokens: rateStateQuery?.data?.programBuyerTAAmount,
			juniorReserveTokens: rateStateQuery?.data?.programSellerTAAmount
		},
		conditions: {
			isDepositSeniorAvailable: rateStateQuery?.data?.isDepositSeniorAvailable(),
			isDepositJuniorAvailable: rateStateQuery?.data?.isDepositJuniorAvailable()
		},
		beneficiaries: {
			seniorAccount: rateStateQuery?.data?.buyerTA,
			seniorOwner: rateStateQuery?.data?.buyerWallet,
			juniorAccount: rateStateQuery?.data?.sellerTA,
			juniorOwner: rateStateQuery?.data?.sellerWallet
		},
		states: {
			rateState: rateStateQuery?.data?.rateState,
			redeemLogicState: rateStateQuery?.data?.redeemLogicState
		},
		aggregatorLastValue: rateStateQuery?.data?.rateState?.aggregatorLastValue
	};

	const buttonConditions = [
		{
			name: 'Deposit Senior',
			condition: rateStateQuery?.data?.isDepositSeniorAvailable(),
			event: onDepositSeniorClick,
			color: 'success' as 'success',
			icon: <PlusIcon />,
			loading: loadingDepositSenior
		},
		{
			name: 'Deposit Junior',
			condition: rateStateQuery?.data?.isDepositJuniorAvailable(),
			event: onDepositJuniorClick,
			color: 'error' as 'error',
			icon: <MinusIcon />,
			loading: loadingDepositJunior
		},
		{
			name: 'Withdraw Senior',
			condition: rateStateQuery?.data?.isWithdrawSeniorAvailable(wallet?.publicKey),
			event: onWithdrawClick,
			color: 'info' as 'info',
			icon: <ResetIcon />,
			loading: loadingWithdraw
		},
		{
			name: 'Withdraw Junior',
			condition: rateStateQuery?.data?.isWithdrawJuniorAvailable(wallet?.publicKey),
			event: onWithdrawClick,
			color: 'info' as 'info',
			icon: <ResetIcon />,
			loading: loadingWithdraw
		},
		{
			name: 'Settle',
			condition: rateStateQuery?.data?.isSettlementAvailable(),
			event: onSettleClick,
			color: 'info' as 'info',
			icon: <RecordIcon />,
			loading: loadingSettle
		},
		{
			name: 'Claim Senior',
			condition: rateStateQuery?.data?.isClaimSeniorAvailable(wallet?.publicKey),
			event: onClaimClick,
			color: 'success' as 'success',
			icon: <CleanIcon />,
			loading: loadingClaim
		},
		{
			name: 'Claim Junior',
			condition: rateStateQuery?.data?.isClaimJuniorAvailable(wallet?.publicKey),
			event: onClaimClick,
			color: 'success' as 'success',
			icon: <CleanIcon />,
			loading: loadingClaim
		}
	];

	const loadingSpinner = !rateStateQuery?.data?.depositExpirationAt || !rateStateQuery?.data?.settleAvailableFromAt;

	return (
		<Layout>
			<Pane clearfix margin={24} maxWidth={400}>
				{loadingSpinner ? (
					<Spinner />
				) : (
					<StatsPanel
						//  @ts-ignore
						contract={contractData}
						buttons={
							<div className={styles.buttons}>
								{buttonConditions.map((buttonCondition) => {
									return (
										buttonCondition.condition && (
											<ButtonPill
												key={buttonCondition.name}
												mode={buttonCondition.color}
												text={buttonCondition.name}
												onClick={buttonCondition.event}
												icon={buttonCondition.icon}
												loading={buttonCondition.loading}
											/>
										)
									);
								})}
							</div>
						}
					/>
				)}

				{/* <ReactJson collapsed src={rateStateQuery.data} /> */}
			</Pane>
		</Layout>
	);
}

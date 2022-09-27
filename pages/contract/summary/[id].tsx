/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import StatsPanel from 'components/organisms/StatsPanel/StatsPanel';
import Layout from 'components/templates/Layout/Layout';
import { Pane } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
import { useRouter } from 'next/router';
import { formatCurrency } from 'utils/numberHelpers';

import { ClaimButton } from './ClaimButton';
import { DepositButton } from './DepositButton';
import { SettleButton } from './SettleButton';
import styles from './summary.module.scss';
import { WithdrawButton } from './WithdrawButton';

// test : WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

export default function SummaryPageId() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

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
			isDepositSeniorAvailable: rateStateQuery?.data?.isDepositBuyerAvailable(wallet.publicKey),
			isDepositJuniorAvailable: rateStateQuery?.data?.isDepositSellerAvailable(wallet.publicKey)
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
								<DepositButton otcStatePubkey={id as string} isBuyer={true} />
								<DepositButton otcStatePubkey={id as string} isBuyer={false} />
								<WithdrawButton otcStatePubkey={id as string} isBuyer={true} />
								<WithdrawButton otcStatePubkey={id as string} isBuyer={false} />
								<SettleButton otcStatePubkey={id as string} />
								<ClaimButton otcStatePubkey={id as string} isBuyer={true} />
								<ClaimButton otcStatePubkey={id as string} isBuyer={false} />
							</div>
						}
					/>
				)}
			</Pane>
		</Layout>
	);
}

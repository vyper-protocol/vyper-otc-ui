/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ClaimButton } from 'components/organisms/actionButtons/ClaimButton';
import { DepositButton } from 'components/organisms/actionButtons/DepositButton';
import { SettleButton } from 'components/organisms/actionButtons/SettleButton';
import { WithdrawButton } from 'components/organisms/actionButtons/WithdrawButton';
import Layout from 'components/templates/Layout/Layout';
import { Pane, toaster, StatusIndicator } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
import { useRouter } from 'next/router';
import { formatCurrency } from 'utils/numberHelpers';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';
import * as solanaFuncs from '@solana/web3.js';

import styles from './summary.module.scss';

// test : WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

export default function SummaryPageId() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	const assetName = rateStateQuery?.data?.rateState?.aggregatorData?.name;

	const contractData = {
		pubkey: id as string,
		asset: String.fromCharCode.apply(null, assetName).split('\u0000')[0],
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
					<>
						<div className={styles.box}>
							<div className={styles.title}>
								<h5 className={styles.symbol}>{contractData.asset}</h5>
								{contractData.pubkey && (
									<p className={styles.disabled} onClick={handleAddressClick} data-id={contractData.pubkey.toString()}>
										{abbreviateAddress(contractData.pubkey.toString())}
									</p>
								)}
							</div>

							<div className={styles.funded}>
								<StatusIndicator color={!contractData.conditions.isDepositSeniorAvailable ? 'success' : 'danger'}>
									{!contractData.conditions.isDepositSeniorAvailable ? 'Senior Funded' : 'Senior not Funded'}
								</StatusIndicator>
								<StatusIndicator color={!contractData.conditions.isDepositJuniorAvailable ? 'success' : 'danger'}>
									{!contractData.conditions.isDepositJuniorAvailable ? 'Junior Funded' : 'Junior not Funded'}
								</StatusIndicator>
							</div>
							<hr />
							<div className={styles.content}>
								{contractData.stats.map((mockItem) => {
									return (
										<div key={mockItem.name} className={styles.column}>
											<p>{mockItem.name}</p>
											<p>{mockItem.value}</p>
										</div>
									);
								})}
							</div>
							<hr />

							{contractData.timestamps.map((timestamp) => {
								return (
									<div key={timestamp.name} className={styles.expirations}>
										<div>
											<p>{timestamp.name}</p>
										</div>
										<div>
											<p>{timestamp.value}</p>
										</div>
									</div>
								);
							})}

							<div className={styles.buttons}>
								<DepositButton otcStatePubkey={id as string} isBuyer={true} />
								<DepositButton otcStatePubkey={id as string} isBuyer={false} />
								<WithdrawButton otcStatePubkey={id as string} isBuyer={true} />
								<WithdrawButton otcStatePubkey={id as string} isBuyer={false} />
								<SettleButton otcStatePubkey={id as string} />
								<ClaimButton otcStatePubkey={id as string} isBuyer={true} />
								<ClaimButton otcStatePubkey={id as string} isBuyer={false} />
							</div>
						</div>
					</>
				)}
			</Pane>
		</Layout>
	);
}

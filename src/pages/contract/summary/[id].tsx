/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import { ClaimButton } from 'components/organisms/actionButtons/ClaimButton';
import { DepositButton } from 'components/organisms/actionButtons/DepositButton';
import { SettleButton } from 'components/organisms/actionButtons/SettleButton';
import { WithdrawButton } from 'components/organisms/actionButtons/WithdrawButton';
import Layout from 'components/templates/Layout/Layout';
import { Pane, toaster, StatusIndicator } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';
import { momentDate, momentDuration } from 'utils/momentHelpers';
import { formatCurrency } from 'utils/numberHelpers';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import styles from './summary.module.scss';

// test : WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

const SummaryPageId = () => {
	const router = useRouter();
	const { connection } = useConnection();
	const wallet = useWallet();

	const { id } = router.query;
	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);
	const asset = String.fromCharCode
		.apply(null, rateStateQuery?.data?.rateState?.aggregatorData?.name)
		.split('\u0000')[0];

	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	const details = [
		{
			text: 'Aggregator value',
			value: formatCurrency(rateStateQuery?.data?.rateState.aggregatorLastValue, true)
		},
		{
			text: 'Duration',
			value: momentDuration(rateStateQuery?.data?.settleAvailableFromAt - rateStateQuery?.data?.depositExpirationAt)
		},
		{
			text: 'Strike',
			value: formatCurrency(rateStateQuery?.data?.redeemLogicState.strike, true)
		}
	];

	const timestamps = [
		{
			text: 'Created at',
			value: momentDate(rateStateQuery?.data?.createdAt)
		},
		{ text: 'Deposit start', value: momentDate(rateStateQuery?.data?.depositAvailableFrom) },
		{ text: 'Deposit expire', value: momentDate(rateStateQuery?.data?.depositExpirationAt) },
		{
			text: 'Settle available',
			value: momentDate(rateStateQuery?.data?.settleAvailableFromAt)
		}
	];

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
								<h5 className={styles.symbol}>{asset}</h5>
								{id && (
									<p
										className={cn(styles.disabled, styles.pubkey)}
										onClick={handleAddressClick}
										data-id={id.toString()}
									>
										{abbreviateAddress(id.toString())}
									</p>
								)}
							</div>

							<div className={styles.funded}>
								<StatusIndicator
									color={!rateStateQuery?.data?.isDepositBuyerAvailable(wallet.publicKey) ? 'success' : 'danger'}
								>
									{!rateStateQuery?.data?.isDepositBuyerAvailable(wallet.publicKey)
										? 'Senior Funded'
										: 'Senior not Funded'}
								</StatusIndicator>
								<StatusIndicator
									color={!rateStateQuery?.data?.isDepositSellerAvailable(wallet.publicKey) ? 'success' : 'danger'}
								>
									{!rateStateQuery?.data?.isDepositSellerAvailable(wallet.publicKey)
										? 'Junior Funded'
										: 'Junior not Funded'}
								</StatusIndicator>
							</div>
							<hr />
							<div className={styles.content}>
								{details.map((detail) => {
									return (
										<div key={detail.text} className={styles.column}>
											<p>{detail.text}</p>
											<p>{detail.value}</p>
										</div>
									);
								})}
							</div>
							<hr />

							{timestamps.map((timestamp) => {
								return (
									<div key={timestamp.text} className={styles.expirations}>
										<div>
											<p>{timestamp.text}</p>
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
};

export default SummaryPageId;

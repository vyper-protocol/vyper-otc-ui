/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import ClaimButton from 'components/organisms/actionButtons/ClaimButton';
import DepositButton from 'components/organisms/actionButtons/DepositButton';
import SettleButton from 'components/organisms/actionButtons/SettleButton';
import WithdrawButton from 'components/organisms/actionButtons/WithdrawButton';
import Layout from 'components/templates/Layout';
import { Pane, toaster, StatusIndicator, Button, Badge, Tooltip, InfoSignIcon, HelpIcon, Card } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import moment from 'moment';
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
	const asset = rateStateQuery?.data?.rateState?.getAggregatorName();

	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	// TODO fetch from chain
	const reserveMintSymbol = 'USDC';

	const loadingSpinner = !rateStateQuery?.data?.depositExpirationAt || !rateStateQuery?.data?.settleAvailableFromAt;

	return (
		<Layout>
			<Pane clearfix margin={24} maxWidth={400}>
				{loadingSpinner ? (
					<Spinner />
				) : (
					<>
						<div className={styles.box}>
							{/* + + + + + + + + + + + + +  */}
							{/* PLUGIN USED */}

							<Pane width="100%" display="flex" alignItems="center">
								<Badge color="purple" margin={6}>
									FORWARD
								</Badge>
								<div style={{ flex: 1 }} />
								{Date.now() > rateStateQuery?.data?.settleAvailableFromAt ? (
									<Badge color="red" margin={6}>
										Expired
									</Badge>
								) : (
									<Badge color="green" margin={6}>
										Active
									</Badge>
								)}
							</Pane>

							{/* + + + + + + + + + + + + +  */}
							{/* FUNDED SIDES */}

							<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
								<Badge color={rateStateQuery?.data?.isBuyerFunded() ? 'green' : 'red'} margin={6}>
									{rateStateQuery?.data?.isBuyerFunded() ? 'Long Funded' : 'Long unfunded'}
								</Badge>

								<div style={{ flex: 1 }} />

								<Badge color={rateStateQuery?.data?.isSellerFunded() ? 'green' : 'red'} margin={6}>
									{rateStateQuery?.data?.isSellerFunded() ? 'Short Funded' : 'Short unfunded'}
								</Badge>
							</Pane>
							<hr />

							{/* + + + + + + + + + + + + +  */}
							{/* TITLE AND SYMBOL */}

							<Pane width="100%" justifyContent="center" alignItems="center">
								<Pane width="100%" textAlign="center">
									<h5>{asset}</h5>
								</Pane>
								<Pane width="100%" textAlign="center">
									{id && (
										<Button onClick={handleAddressClick} data-id={id.toString()}>
											{abbreviateAddress(id.toString())}
										</Button>
									)}
								</Pane>
							</Pane>
							<hr />

							{/* + + + + + + + + + + + + +  */}
							{/* DETAILS */}

							<div className={styles.content}>
								<div className={styles.column}>
									<p>Current Price</p>
									<p>{formatCurrency(rateStateQuery?.data?.rateState.aggregatorLastValue, true)}</p>
								</div>
								<div className={styles.column}>
									<p>Strike</p>
									<p>{formatCurrency(rateStateQuery?.data?.redeemLogicState.strike, true)}</p>
								</div>

								<div className={styles.column}>
									<p>
										Size
										<Tooltip content="TBD help-text-notional" position="right">
											<HelpIcon size={12} marginX={3} />
										</Tooltip>
									</p>
									<p>{rateStateQuery?.data?.redeemLogicState.notional}</p>
								</div>

								{!rateStateQuery?.data.isDepositExpired() && !rateStateQuery?.data.areBothSidesFunded() && (
									<div className={styles.column}>
										<p>Deposit expiry</p>
										<p>
											<MomentTooltipSpan datetime={rateStateQuery?.data?.depositExpirationAt} />
										</p>
									</div>
								)}

								<div className={styles.column}>
									<p>Expiry</p>

									<p>
										<MomentTooltipSpan datetime={rateStateQuery?.data?.settleAvailableFromAt} />
									</p>
								</div>

								{rateStateQuery?.data?.buyerWallet && wallet?.publicKey?.toBase58() === rateStateQuery?.data?.buyerWallet?.toBase58() && (
									<div className={styles.column}>
										<p>Your side</p>
										<p>
											<Badge color="green">LONG</Badge>
										</p>
									</div>
								)}

								{rateStateQuery?.data?.sellerWallet && wallet?.publicKey?.toBase58() === rateStateQuery?.data?.sellerWallet?.toBase58() && (
									<div className={styles.column}>
										<p>Your side</p>
										<p>
											<Badge color="red">SHORT</Badge>
										</p>
									</div>
								)}
							</div>

							<hr />

							{/* + + + + + + + + + + + + +  */}
							{/* COLLATERAL AMOUNTS */}

							<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
								<b>Collateral</b>
							</Pane>

							<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
								<Pane margin={6} textAlign="center">
									Long{' '}
									<Badge color="neutral">
										{rateStateQuery?.data?.buyerDepositAmount} {reserveMintSymbol}
									</Badge>
								</Pane>
								<Pane margin={6} textAlign="center">
									Short{' '}
									<Badge color="neutral">
										{rateStateQuery?.data?.sellerDepositAmount} {reserveMintSymbol}
									</Badge>
								</Pane>
							</Pane>

							<hr />

							{/* + + + + + + + + + + + + +  */}
							{/* PnL */}

							{rateStateQuery?.data?.isPnlAvailable() && (
								<>
									<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
										<b>PnL</b>
									</Pane>

									<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
										<Pane margin={6} textAlign="center">
											Long{' '}
											<Badge color={rateStateQuery?.data?.getPnlBuyer() > 0 ? 'green' : 'red'}>
												{rateStateQuery?.data?.getPnlBuyer()} {reserveMintSymbol}
											</Badge>
										</Pane>
										<Pane margin={6} textAlign="center">
											Short{' '}
											<Badge color={rateStateQuery?.data?.getPnlSeller() > 0 ? 'green' : 'red'}>
												{rateStateQuery?.data?.getPnlSeller()} {reserveMintSymbol}
											</Badge>
										</Pane>
									</Pane>
								</>
							)}

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

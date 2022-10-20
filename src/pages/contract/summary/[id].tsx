/* eslint-disable space-before-function-paren */
import { useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import ClaimButton from 'components/organisms/actionButtons/ClaimButton';
import DepositButton from 'components/organisms/actionButtons/DepositButton';
import SettleButton from 'components/organisms/actionButtons/SettleButton';
import WithdrawButton from 'components/organisms/actionButtons/WithdrawButton';
import OracleLivePrice from 'components/organisms/OracleLivePrice';
import Simulator from 'components/organisms/Simulator/Simulator';
import Layout from 'components/templates/Layout';
import { Pane, Button, Badge, Tooltip, HelpIcon, PanelStatsIcon as ToggleSimulator } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

// eslint-disable-next-line css-modules/no-unused-class
import styles from './summary.module.scss';

const SummaryPageId = () => {
	const router = useRouter();
	const { connection } = useConnection();
	const wallet = useWallet();

	const [showSimulator, setShowSimulator] = useState(false);

	const { id } = router.query;

	// Pass the cluster option as a unique indetifier to the query
	const rateStateQuery = useGetFetchOTCStateQuery(connection, id as string);

	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toast.info('Address copied to clipboard', {
			autoClose: 2000
		});
	};

	const handleToggle = () => {
		setShowSimulator(!showSimulator);
	};

	const reserveTokenInfo = rateStateQuery?.data?.reserveTokenInfo;

	const loadingSpinner = rateStateQuery?.isLoading;
	const errorMessage = rateStateQuery?.isError;
	const showContent = rateStateQuery?.isSuccess;

	return (
		<Layout withSearch>
			<Pane clearfix margin={24} maxWidth={620}>
				{errorMessage && <p>Contract not found</p>}

				{loadingSpinner && <Spinner />}

				{showContent && !errorMessage && !loadingSpinner && rateStateQuery?.data && (
					<div className={styles.cards}>
						<div className={cn(styles.box, showSimulator && styles.changeEdge)}>
							<span className={styles.toggle} onClick={handleToggle} style={{ color: showSimulator && 'var(--color-primary)' }}>
								Simulator
								<ToggleSimulator />
							</span>

							{/* + + + + + + + + + + + + +  */}
							{/* PLUGIN USED */}
							<Pane width="100%" display="flex" alignItems="center">
								<Badge color="purple" margin={6}>
									FORWARD
								</Badge>
								<div style={{ flex: 1 }} />
								<ContractStatusBadge status={rateStateQuery.data.getContractStatus()} />
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
									<h5>{rateStateQuery?.data?.getContractTitle()}</h5>
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
								{rateStateQuery?.data?.settleExecuted ? (
									<div className={styles.column}>
										<p>Settlement price</p>
										<p>{formatWithDecimalDigits(rateStateQuery?.data?.priceAtSettlement)}</p>
									</div>
								) : (
									<div className={styles.column}>
										<p>Current Price</p>
										<OracleLivePrice
											oracleType={rateStateQuery?.data?.rateState.getTypeId()}
											pubkey={rateStateQuery?.data?.rateState.pubkeyForLivePrice.toBase58()}
										/>
									</div>
								)}

								{rateStateQuery?.data?.redeemLogicState.getPluginDetails().map((c) => (
									<div key={c.label} className={styles.column}>
										<p>
											{c.label}
											{c.tooltip && (
												<Tooltip content={c.tooltip} position="right">
													<HelpIcon size={12} marginX={3} />
												</Tooltip>
											)}
										</p>
										<p>{formatWithDecimalDigits(c.value)}</p>
									</div>
								))}

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
							<Pane width="100%" display="flex" justifyContent="space-evenly" alignItems="center">
								<Pane margin={6} textAlign="center">
									Long
									<br />
									<Badge color="neutral">
										{rateStateQuery?.data?.buyerDepositAmount} {reserveTokenInfo?.symbol}
									</Badge>
								</Pane>
								<Pane margin={6} textAlign="center">
									Short
									<br />
									<Badge color="neutral">
										{rateStateQuery?.data?.sellerDepositAmount} {reserveTokenInfo?.symbol}
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

									<Pane width="100%" display="flex" justifyContent="space-evenly" alignItems="center">
										<Pane margin={6} textAlign="center">
											Long
											<br />
											<Badge color={rateStateQuery?.data?.getPnlBuyer() > 0 ? 'green' : 'red'}>
												{formatWithDecimalDigits(rateStateQuery?.data?.getPnlBuyer())} {reserveTokenInfo?.symbol}
											</Badge>
										</Pane>
										<Pane margin={6} textAlign="center">
											Short
											<br />
											<Badge color={rateStateQuery?.data?.getPnlSeller() > 0 ? 'green' : 'red'}>
												{formatWithDecimalDigits(rateStateQuery?.data?.getPnlSeller())} {reserveTokenInfo?.symbol}
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
						<Simulator className={cn(styles.simulator, showSimulator ? styles.show : styles.hide)} />
					</div>
				)}
			</Pane>
		</Layout>
	);
};

export default SummaryPageId;

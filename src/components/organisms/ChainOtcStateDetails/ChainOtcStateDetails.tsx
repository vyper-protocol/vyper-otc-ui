import { useState } from 'react';

import { Tooltip, Chip, Button, Box } from '@mui/material';
import { InsertChartOutlined as ToggleSimulator, Help as HelpIcon } from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
import { toast } from 'react-toastify';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import ClaimButton from '../actionButtons/ClaimButton';
import DepositButton from '../actionButtons/DepositButton';
import SettleButton from '../actionButtons/SettleButton';
import WithdrawButton from '../actionButtons/WithdrawButton';
import Simulator from '../Simulator/Simulator';
import styles from './ChainOtcStateDetails.module.scss';

export type ChainOtcStateDetailsInput = {
	otcState: ChainOtcState;
};

const ChainOtcStateDetails = ({ otcState }: ChainOtcStateDetailsInput) => {
	const wallet = useWallet();

	const [showSimulator, setShowSimulator] = useState(false);

	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toast.info('Address copied to clipboard', {
			autoClose: 2000
		});
	};

	const handleDocumentationClick = () => {
		window.open(otcState.redeemLogicState.documentationLink);
	};

	const handleToggle = () => {
		setShowSimulator(!showSimulator);
	};

	const reserveTokenInfo = otcState.reserveTokenInfo;

	const { pricesValue: livePricesValue, isInitialized: livePriceIsInitialized } = useOracleLivePrice(
		otcState.rateState.typeId,
		otcState.rateState.livePriceAccounts.map((c) => c.toBase58())
	);

	return (
		<div className={styles.cards}>
			<div className={cn(styles.box, showSimulator && styles.changeEdge)}>
				<span className={styles.toggle} onClick={handleToggle} style={{ color: showSimulator && 'var(--color-primary)' }}>
					Simulator
					<ToggleSimulator fontSize="small" />
				</span>

				{/* + + + + + + + + + + + + +  */}
				{/* PLUGIN USED */}
				<Box sx={{
					width: '100%',
					display: 'flex',
					alignItems: 'center'
				}}>
					<Chip label={otcState.redeemLogicState.typeId} variant="outlined" color="secondary" size="small" sx={{ marginX: '3px', textTransform: 'capitalize' }}/>

					<Tooltip title={'Contract payoff: ' + _.startCase(otcState.redeemLogicState.typeId)} placement="right">
						<HelpIcon fontSize="small" onClick={handleDocumentationClick} className={styles.notionHelp} />
					</Tooltip>
					<div style={{ flex: 1 }} />
					<ContractStatusBadge status={otcState.getContractStatus()} />
				</Box>

				{/* + + + + + + + + + + + + +  */}
				{/* FUNDED SIDES */}
				<Box sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}>
					<Chip label={otcState.isBuyerFunded() ? 'Long Funded' : 'Long unfunded'} variant="outlined" color={otcState.isBuyerFunded() ? 'success' : 'error'} size="small" sx={{ margin: '6px', textTransform: 'capitalize' }} />

					<div style={{ flex: 1 }} />

					<Chip label={otcState.isSellerFunded() ? 'Short Funded' : 'Short unfunded'} variant="outlined" color={otcState.isSellerFunded() ? 'success' : 'error'} size="small" sx={{ margin: '6px', textTransform: 'capitalize' }} />
				</Box>
				<hr />

				{/* + + + + + + + + + + + + +  */}
				{/* TITLE AND SYMBOL */}
				<Box sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
					<Box sx={{ width: "100%", textAlign: "center" }}>
						<h5>{otcState.getContractTitle()}</h5>
					</Box>
					<Box sx={{ width: "100%", textAlign: "center" }}>
						<Button variant="outlined" onClick={handleAddressClick} data-id={otcState.publickey.toBase58()}>
							{abbreviateAddress(otcState.publickey.toBase58())}
						</Button>
					</Box>
				</Box>
				<hr />

				{/* + + + + + + + + + + + + +  */}
				{/* DETAILS */}
				<div className={styles.content}>
					{otcState.settleExecuted &&
						otcState.redeemLogicState.settlementPricesDescription.map((priceAtSet, i) => (
							<div key={i} className={styles.column}>
								<p>{priceAtSet}</p>
								<p>{formatWithDecimalDigits(otcState.pricesAtSettlement[i])}</p>
							</div>
						))}

					{!otcState.settleExecuted &&
						livePriceIsInitialized &&
						otcState.redeemLogicState.rateFeedsDescription.map((rateFeedDescr, i) => (
							<div key={i} className={styles.column}>
								<p>{rateFeedDescr}</p>
								<p>{formatWithDecimalDigits(livePricesValue[i])}</p>
							</div>
						))}

					{otcState.redeemLogicState.pluginDetails.map((c) => (
						<div key={c.label} className={styles.column}>
							<p>
								{c.label}
								{c.tooltip && (
									<Tooltip title={c.tooltip} placement="right">
										<HelpIcon fontSize="small" sx={{ marginX: '3px', textTransform: 'capitalize' }} />
									</Tooltip>
								)}
							</p>
							<p>{typeof c.value === 'number' ? formatWithDecimalDigits(c.value) : c.value}</p>
						</div>
					))}

					{!otcState.isDepositExpired() && !otcState.areBothSidesFunded() && (
						<div className={styles.column}>
							<p>Deposit expiry</p>
							<p>
								<MomentTooltipSpan datetime={otcState.depositExpirationAt} />
							</p>
						</div>
					)}

					<div className={styles.column}>
						<p>Expiry</p>

						<p>
							<MomentTooltipSpan datetime={otcState.settleAvailableFromAt} />
						</p>
					</div>

					{otcState.buyerWallet && wallet?.publicKey?.toBase58() === otcState.buyerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
								<Chip label="LONG" variant="outlined" color="success" size="small" />
							</p>
						</div>
					)}

					{otcState.sellerWallet && wallet?.publicKey?.toBase58() === otcState.sellerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
							<Chip label="SHORT" variant="outlined" color="error" size="small" />
							</p>
						</div>
					)}
				</div>
				<hr />
				{/* + + + + + + + + + + + + +  */}
				{/* COLLATERAL AMOUNTS */}
				<Box sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}>
					<b>Collateral</b>
				</Box>
				<Box sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}>
					<Box sx={{ margin: "6px", textAlign: "center" }}>
						Long
						<br />
						<Chip variant="outlined" size="small" label={`${otcState.buyerDepositAmount} ${reserveTokenInfo?.symbol ?? ''}`} />
					</Box>
					<Box sx={{ margin: "6px", textAlign: "center" }}>
						Short
						<br />
						<Chip variant="outlined" size="small" label={`${otcState.sellerDepositAmount} ${reserveTokenInfo?.symbol ?? ''}`} />
					</Box>
				</Box>
				<hr />
				{/* + + + + + + + + + + + + +  */}
				{/* PnL */}
				{livePriceIsInitialized && otcState.isPnlAvailable() && (
					<>
						<Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
							<b>PnL</b>
						</Box>

						<Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
							<Box sx={{ margin: "6px", textAlign: "center" }}>
								Long
								<br />
								<Chip label={`${formatWithDecimalDigits(otcState.getPnlBuyer(livePricesValue))} ${reserveTokenInfo?.symbol ?? ''}`} variant="outlined" color={otcState.getPnlBuyer(livePricesValue) > 0 ? 'success' : 'error'} size="small" />
							</Box>
							<Box sx={{ margin: "6px", textAlign: "center" }}>
								Short
								<br />
								<Chip label={`${formatWithDecimalDigits(otcState.getPnlSeller(livePricesValue))} ${reserveTokenInfo?.symbol ?? ''}`} variant="outlined" color={otcState.getPnlSeller(livePricesValue) > 0 ? 'success' : 'error'} size="small" />
							</Box>
						</Box>
					</>
				)}
				<div className={styles.buttons}>
					<DepositButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={true} />
					<DepositButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={false} />
					<WithdrawButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={true} />
					<WithdrawButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={false} />
					<SettleButton otcStatePubkey={otcState.publickey.toBase58()} />
					<ClaimButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={true} />
					<ClaimButton otcStatePubkey={otcState.publickey.toBase58()} isBuyer={false} />
				</div>
			</div>
			<Simulator className={cn(styles.simulator, showSimulator ? styles.show : styles.hide)} />
		</div>
	);
};

export default ChainOtcStateDetails;

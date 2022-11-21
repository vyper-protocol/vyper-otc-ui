import { useEffect, useState } from 'react';

import { InsertChartOutlined as ToggleSimulator, Help as HelpIcon } from '@mui/icons-material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Tooltip, Box, IconButton, Stack } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import NumericBadge from 'components/atoms/NumericBadge';
import StatusBadge from 'components/atoms/StatusBadge';
import CoinBadge from 'components/molecules/CoinBadge';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
// eslint-disable-next-line no-unused-vars
import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getRedeemLogicDocumentionLink } from 'utils/urlBuilder';

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

	// const handleAddressClick = (e) => {
	// 	copyToClipboard(e.target.getAttribute('data-id'));
	// 	toast.info('Address copied to clipboard', {
	// 		autoClose: 2000
	// 	});
	// };

	const handleDocumentationClick = () => {
		window.open(getRedeemLogicDocumentionLink(otcState.redeemLogicAccount.state.stateType.type));
	};

	const handleToggle = () => {
		setShowSimulator(!showSimulator);
	};

	const reserveTokenInfo = otcState.reserveTokenInfo;

	const {
		pricesValue: livePricesValue,
		isInitialized: livePriceIsInitialized,
		removeListener
	} = useOracleLivePrice(
		otcState.rateAccount.state.typeId,
		otcState.rateAccount.state.livePriceAccounts.map((c) => c.toBase58())
	);

	useEffect(() => {
		if (otcState.settleExecuted) {
			removeListener();
		}
	}, [otcState.settleExecuted, removeListener]);

	return (
		<div className={styles.cards}>
			<div className={cn(styles.box, showSimulator && styles.changeEdge)}>
				<span className={styles.toggle} onClick={handleToggle} style={{ color: showSimulator && 'var(--color-primary)' }}>
					Simulator
					<ToggleSimulator fontSize="small" />
				</span>

				{/* + + + + + + + + + + + + +  */}
				{/* PLUGIN USED */}
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<StatusBadge label={otcState.redeemLogicAccount.state.getTypeLabel()} mode={'info'} />

					<div style={{ flex: 1 }} />
					<ContractStatusBadge status={otcState.contractStatus} />
				</Box>

				{/* + + + + + + + + + + + + +  */}
				{/* FUNDED SIDES */}
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						my: 1
					}}
				>
					<StatusBadge label={otcState.isBuyerFunded() ? 'Long Funded' : 'Long unfunded'} mode={otcState.isBuyerFunded() ? 'success' : 'error'} />

					<div style={{ flex: 1 }} />

					<StatusBadge label={otcState.isSellerFunded() ? 'Short Funded' : 'Short unfunded'} mode={otcState.isSellerFunded() ? 'success' : 'error'} />
				</Box>
				<hr />

				{/* + + + + + + + + + + + + +  */}
				{/* TITLE AND SYMBOL */}
				<Stack sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
					<Stack direction="row" sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
						<b>{otcState.redeemLogicAccount.state.getTypeLabel().toUpperCase()}</b>
						<Tooltip title="" placement="right">
							<IconButton size="small" color="inherit" onClick={handleDocumentationClick} disableRipple={true}>
								<ArrowOutwardIcon sx={{ width: '15px' }} />
							</IconButton>
						</Tooltip>
					</Stack>
					<h5>{otcState.getContractTitle()}</h5>
				</Stack>
				<hr />

				{/* + + + + + + + + + + + + +  */}
				{/* DETAILS */}
				<div className={styles.content}>
					{otcState.settleExecuted &&
						otcState.redeemLogicAccount.state.settlementPricesDescription.map((priceAtSet, i) => (
							<div key={i} className={styles.column}>
								<p>{priceAtSet}</p>
								<p>{formatWithDecimalDigits(otcState.pricesAtSettlement[i])}</p>
							</div>
						))}

					{!otcState.settleExecuted &&
						livePriceIsInitialized &&
						otcState.redeemLogicAccount.state.rateFeedsDescription.map((rateFeedDescr, i) => (
							<div key={i} className={styles.column}>
								<p>{rateFeedDescr}</p>
								<p>{formatWithDecimalDigits(livePricesValue[i])}</p>
							</div>
						))}

					{otcState.redeemLogicAccount.state.pluginDetails.map((c) => (
						<div key={c.label} className={styles.column}>
							<p>
								{c.label}
								{c.tooltip && (
									<Tooltip title={c.tooltip} placement="right">
										<HelpIcon fontSize="small" sx={{ width: '15px' }} />
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
								<StatusBadge label="LONG" mode="success" />
							</p>
						</div>
					)}

					{otcState.sellerWallet && wallet?.publicKey?.toBase58() === otcState.sellerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
								<StatusBadge label="SHORT" mode="error" />
							</p>
						</div>
					)}
				</div>
				<hr />
				{/* + + + + + + + + + + + + +  */}
				{/* COLLATERAL AMOUNTS */}
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<b>Collateral {reserveTokenInfo?.name ?? ''}</b>
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-evenly',
						alignItems: 'center'
					}}
				>
					<CoinBadge title="Long" amount={otcState.buyerDepositAmount} token={reserveTokenInfo} />
					<CoinBadge title="Short" amount={otcState.sellerDepositAmount} token={reserveTokenInfo} />
				</Box>
				<hr />
				{/* + + + + + + + + + + + + +  */}
				{/* PnL */}
				{livePriceIsInitialized && otcState.isPnlAvailable() && (
					<>
						<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<b>PnL</b>
						</Box>

						<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
							<Box sx={{ margin: '6px', textAlign: 'center' }}>
								Long
								<br />
								<NumericBadge
									label={`${formatWithDecimalDigits(otcState.getPnlBuyer(livePricesValue))} ${reserveTokenInfo?.symbol ?? ''}`}
									mode={otcState.getPnlBuyer(livePricesValue) > 0 ? 'success' : 'error'}
								/>
							</Box>
							<Box sx={{ margin: '6px', textAlign: 'center' }}>
								Short
								<br />
								<NumericBadge
									label={`${formatWithDecimalDigits(otcState.getPnlSeller(livePricesValue))} ${reserveTokenInfo?.symbol ?? ''}`}
									mode={otcState.getPnlSeller(livePricesValue) > 0 ? 'success' : 'error'}
								/>
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

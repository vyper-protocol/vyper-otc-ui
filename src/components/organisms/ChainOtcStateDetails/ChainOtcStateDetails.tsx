import { useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import CoinBadge from 'components/molecules/CoinBadge';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { Badge, HelpIcon, InfoSignIcon, Pane, PanelStatsIcon as ToggleSimulator } from 'evergreen-ui';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
// import _ from 'lodash';
import { ChainOtcState } from 'models/ChainOtcState';
// import { toast } from 'react-toastify';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

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
		window.open(otcState.redeemLogicState.documentationLink);
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
		otcState.rateState.typeId,
		otcState.rateState.livePriceAccounts.map((c) => c.toBase58())
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
					<ToggleSimulator />
				</span>

				{/* + + + + + + + + + + + + +  */}
				{/* PLUGIN USED */}
				<Pane width="100%" display="flex" alignItems="center">
					<Badge color="purple" margin={6}>
						{otcState.rateState.typeId}
					</Badge>
					<div style={{ flex: 1 }} />
					<ContractStatusBadge status={otcState.getContractStatus()} />
				</Pane>

				{/* + + + + + + + + + + + + +  */}
				{/* FUNDED SIDES */}
				<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
					<Badge color={otcState.isBuyerFunded() ? 'green' : 'red'} margin={6}>
						{otcState.isBuyerFunded() ? 'Long Funded' : 'Long unfunded'}
					</Badge>

					<div style={{ flex: 1 }} />

					<Badge color={otcState.isSellerFunded() ? 'green' : 'red'} margin={6}>
						{otcState.isSellerFunded() ? 'Short Funded' : 'Short unfunded'}
					</Badge>
				</Pane>
				<hr />

				{/* + + + + + + + + + + + + +  */}
				{/* TITLE AND SYMBOL */}
				<Pane width="100%" justifyContent="center" alignItems="center" textAlign="center">
					<b>{otcState.redeemLogicState.typeId.toUpperCase()}</b>
					<Tooltip title="" placement="right">
						<InfoSignIcon size={12} marginX={3} onClick={handleDocumentationClick} className={styles.notionHelp} />
					</Tooltip>
					<h5>{otcState.getContractTitle()}</h5>
				</Pane>
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
										<HelpIcon size={12} marginX={3} />
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
								<Badge color="green">LONG</Badge>
							</p>
						</div>
					)}

					{otcState.sellerWallet && wallet?.publicKey?.toBase58() === otcState.sellerWallet?.toBase58() && (
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
				<Pane width="100%" display="flex" justifyContent="center" alignItems="center" marginBottom={4}>
					<b>Collateral</b>
				</Pane>

				<Pane width="100%" display="flex" justifyContent="space-evenly" alignItems="center">
					<CoinBadge title="Long" amount={otcState.buyerDepositAmount} token={reserveTokenInfo} />
					<CoinBadge title="Short" amount={otcState.sellerDepositAmount} token={reserveTokenInfo} />
				</Pane>
				<hr />
				{/* + + + + + + + + + + + + +  */}
				{/* PnL */}
				{livePriceIsInitialized && otcState.isPnlAvailable() && (
					<>
						<Pane width="100%" display="flex" justifyContent="center" alignItems="center">
							<b>PnL</b>
						</Pane>

						<Pane width="100%" display="flex" justifyContent="space-evenly" alignItems="center">
							<Pane margin={6} textAlign="center">
								Long
								<br />
								<Badge color={otcState.getPnlBuyer(livePricesValue) > 0 ? 'green' : 'red'}>
									{formatWithDecimalDigits(otcState.getPnlBuyer(livePricesValue))} {reserveTokenInfo?.symbol}
								</Badge>
							</Pane>
							<Pane margin={6} textAlign="center">
								Short
								<br />
								<Badge color={otcState.getPnlSeller(livePricesValue) > 0 ? 'green' : 'red'}>
									{formatWithDecimalDigits(otcState.getPnlSeller(livePricesValue))} {reserveTokenInfo?.symbol}
								</Badge>
							</Pane>
						</Pane>
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

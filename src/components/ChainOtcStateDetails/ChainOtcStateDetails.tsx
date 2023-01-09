import { useEffect, useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ShareIcon from '@mui/icons-material/Share';
import { Tooltip, Box, Grid, Collapse } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import BooleanBadge from 'components/BooleanBadge';
import ClickableIcon from 'components/ClickableIcon';
import ContractStatusBadge from 'components/ContractStatusBadge';
import LoadingValue from 'components/LoadingValue';
import MomentTooltipSpan from 'components/MomentTooltipSpan';
import ShareModal from 'components/ShareModal';
import StatusBadge from 'components/StatusBadge';
import TokenSymbol from 'components/TokenSymbol';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { OtcContract } from 'models/OtcContract';
import moment from 'moment';
import { useRouter } from 'next/router';
import useContractStore from 'store/useContractStore';
import { getSidesLabelShort } from 'utils/aliasHelper';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import { getPayoffDocumentionLink } from 'utils/payoffMetadataHelper';

import ClaimButton from '../actionButtons/ClaimButton';
import DepositButton from '../actionButtons/DepositButton';
import SettleButton from '../actionButtons/SettleButton';
import WithdrawButton from '../actionButtons/WithdrawButton';
import Simulator from '../Simulator/Simulator';
import styles from './ChainOtcStateDetails.module.scss';
import { createDefaultInitParams } from 'configs/defaults';

export type ChainOtcStateDetailsInput = {
	otcState: OtcContract;
	isFetching: boolean;
	onRefetchClick: () => void;
};

const ChainOtcStateDetails = ({ otcState, isFetching, onRefetchClick }: ChainOtcStateDetailsInput) => {
	const wallet = useWallet();
	const router = useRouter();

	const [longLabel, shortLabel] = getSidesLabelShort(otcState.aliasId);
	// const isOption = isOptionAlias(otcState.aliasId);

	const [openShare, setOpenShare] = useState(false);
	const handleOpenShare = () => setOpenShare(true);
	const handleCloseShare = () => setOpenShare(false);

	const { create } = useContractStore();

	const cloneContract = () => {
		const depositEndMoment = moment().add(15, 'minutes');

		// https://momentjs.com/docs/#/parsing/unix-timestamp-milliseconds/
		const chainDataSettleAvailableFromAtMoment = moment(otcState.chainData.settleAvailableFromAt);
		const chainDataDepositExpirationAtMoment = moment(otcState.chainData.depositExpirationAt);
		const settleStartMoment = depositEndMoment.clone().add(chainDataSettleAvailableFromAtMoment.diff(chainDataDepositExpirationAtMoment));

		create({
			...createDefaultInitParams(),

			collateralMint: otcState.chainData.collateralMint.toBase58(),
			longDepositAmount: otcState.chainData.buyerDepositAmount,
			shortDepositAmount: otcState.chainData.sellerDepositAmount,
			depositStart: moment().add(-60, 'minutes').toDate().getTime(),
			depositEnd: depositEndMoment.toDate().getTime(),
			settleStart: settleStartMoment.toDate().getTime(),
			aliasId: otcState.aliasId,
			payoffOption: {
				payoffId: otcState.chainData.redeemLogicAccount.state.payoffId,
				...otcState.chainData.redeemLogicAccount.state.getPluginDataObj()
			},
			rateOption: {
				ratePluginType: otcState.chainData.rateAccount.state.rateId,
				// TODO extract this information in a clearer way
				rateAccounts: otcState.chainData.rateAccount.state.accountsRequiredForRefresh.map((c) => c.toBase58())
			},
			saveOnDatabase: true,
			sendNotification: true
		});
		router.push('/contract/create');
	};

	const [showSimulator, setShowSimulator] = useState(false);

	// const handleAddressClick = (e) => {
	// 	copyToClipboard(e.target.getAttribute('data-id'));
	// 	toast.info('Address copied to clipboard', {
	// 		autoClose: 2000
	// 	});
	// };

	const collateralTokenInfo = otcState.chainData.collateralTokenInfo;

	const {
		pricesValue: livePricesValue,
		isInitialized: livePriceIsInitialized,
		removeListener
	} = useOracleLivePrice(
		otcState.chainData.rateAccount.state.rateId,
		otcState.chainData.rateAccount.state.livePriceAccounts.map((c) => c.toBase58())
	);

	useEffect(() => {
		if (otcState.chainData.settleExecuted) {
			removeListener();
		}
	}, [otcState.chainData.settleExecuted, removeListener]);

	const oracleInfo = getOracleByPubkey(otcState.chainData.rateAccount.state.accountsRequiredForRefresh[0].toBase58());
	const isUsdQuote = oracleInfo?.quoteCurrency === 'USD';
	const quoteCcy = oracleInfo?.baseCurrency;

	const longPnl = otcState.chainData.getLongPnl(livePricesValue);
	const shortPnl = otcState.chainData.getShortPnl(livePricesValue);

	const longPnlFormat = formatWithDecimalDigits(longPnl, Number.isInteger(longPnl) ? 0 : 2);
	const shortPnlFormat = formatWithDecimalDigits(shortPnl, Number.isInteger(shortPnl) ? 0 : 2);

	return (
		<div className={styles.cards}>
			<div className={cn(styles.box, showSimulator && styles.changeEdge)}>
				<div className={styles.iconGroup}>
					<Box role="span" sx={{ display: 'inline-flex' }}>
						<ContractStatusBadge status={otcState.chainData.contractStatus} />
						<Tooltip title={'Open docs'} arrow placement="bottom">
							<a href={getPayoffDocumentionLink(otcState.chainData.redeemLogicAccount.state.payoffId)} target="_blank" rel="noopener noreferrer">
								<StatusBadge label={otcState.aliasId} mode="info" />
							</a>
						</Tooltip>
					</Box>
					<span>
						<ClickableIcon onClick={handleOpenShare} label={'Share contract'} clickedLabel={''}>
							<ShareIcon fontSize="small" sx={{ mx: 0.5 }} />
						</ClickableIcon>
						<ClickableIcon onClick={onRefetchClick} label={'Refresh'} clickedLabel={'Refreshing...'}>
							<LoopIcon className={cn(isFetching && styles.rotating)} fontSize="small" sx={{ mx: 0.5 }} />
						</ClickableIcon>

						<ClickableIcon onClick={cloneContract} label={'Clone contract'} clickedLabel={'Cloning...'}>
							<ContentCopyIcon fontSize="small" sx={{ mx: 0.5 }} />
						</ClickableIcon>
						<ClickableIcon
							onClick={() => {
								setShowSimulator(!showSimulator);
							}}
							label={showSimulator ? 'Close simulator' : 'Open simulator'}
						>
							<QueryStatsIcon fontSize="small" sx={{ mx: 0.5 }} />
						</ClickableIcon>
					</span>
				</div>

				{/* + + + + + + + + + + + + +  */}
				{/* TITLE AND SYMBOL */}
				<div className={styles.titleContainer}>
					<LoadingValue isLoading={isFetching}>
						<div className={styles.title}>{otcState.chainData.getContractTitle()}</div>
					</LoadingValue>
				</div>

				<hr />

				<div className={styles.content}>
					{otcState.chainData.settleExecuted &&
						otcState.chainData.redeemLogicAccount.state.settlementPricesDescription.map((priceAtSet, i) => (
							<div key={i} className={styles.column}>
								<p>{priceAtSet}</p>
								<LoadingValue isLoading={isFetching}>
									<p>
										{isUsdQuote ? '$' : ''}
										{formatWithDecimalDigits(otcState.chainData.pricesAtSettlement[i])}
									</p>
								</LoadingValue>
							</div>
						))}

					{!otcState.chainData.settleExecuted &&
						livePriceIsInitialized &&
						otcState.chainData.redeemLogicAccount.state.rateFeedsDescription.map((rateFeedDescr, i) => (
							<div key={i} className={styles.column}>
								<p>{rateFeedDescr}</p>
								<LoadingValue isLoading={isFetching}>
									<p>
										{isUsdQuote ? '$' : ''}
										{formatWithDecimalDigits(livePricesValue[i])}
									</p>
								</LoadingValue>
							</div>
						))}

					{otcState.chainData.redeemLogicAccount.state.pluginDetails.map((c) => (
						<div key={c.label} className={styles.column}>
							<p>
								<Box sx={{ display: 'inline-flex' }}>
									{c.label}
									{c.tooltip && (
										<Tooltip role="span" title={c.tooltip} placement="right">
											<HelpOutlineOutlinedIcon fontSize="small" sx={{ ml: 0.25, width: '14px' }} />
										</Tooltip>
									)}
								</Box>
							</p>
							<LoadingValue isLoading={isFetching}>
								<p>
									{c.label.toLowerCase() === 'strike' && isUsdQuote ? '$' : ''}
									{typeof c.value === 'number' ? formatWithDecimalDigits(c.value) : c.value}
									{c.label.toLowerCase() === 'size' && quoteCcy ? ` ${quoteCcy}` : ''}
								</p>
							</LoadingValue>
						</div>
					))}

					{!otcState.chainData.isDepositExpired() && !otcState.chainData.areBothSidesFunded() && (
						<div className={styles.column}>
							<p>Deposit expiry</p>
							<LoadingValue isLoading={isFetching}>
								<p>
									<MomentTooltipSpan datetime={otcState.chainData.depositExpirationAt} />
								</p>
							</LoadingValue>
						</div>
					)}

					<div className={styles.column}>
						<p>Expiry</p>
						<LoadingValue isLoading={isFetching}>
							<p>
								<MomentTooltipSpan datetime={otcState.chainData.settleAvailableFromAt} />
							</p>
						</LoadingValue>
					</div>

					{otcState.chainData.buyerWallet && otcState.chainData.sellerWallet && wallet?.publicKey?.toBase58() === otcState.chainData.buyerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your PnL</p>
							<p className={cn(longPnl >= 0 ? styles.profit : styles.loss)}>{`${longPnlFormat} ${quoteCcy ?? ''}`}</p>
						</div>
					)}

					{otcState.chainData.buyerWallet && wallet?.publicKey?.toBase58() === otcState.chainData.buyerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
								<StatusBadge label={longLabel} mode="success" />
							</p>
						</div>
					)}

					{otcState.chainData.buyerWallet && otcState.chainData.sellerWallet && wallet?.publicKey?.toBase58() === otcState.chainData.sellerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your PnL</p>
							<p className={cn(longPnl >= 0 ? styles.profit : styles.loss)}>{`${longPnlFormat} ${quoteCcy ?? ''}`}</p>
						</div>
					)}

					{otcState.chainData.sellerWallet && wallet?.publicKey?.toBase58() === otcState.chainData.sellerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
								<StatusBadge label={shortLabel} mode="error" />
							</p>
						</div>
					)}
				</div>
				<hr />

				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<b>Collateral: {collateralTokenInfo && <TokenSymbol token={collateralTokenInfo} />}</b>

					<Grid container spacing={0.5} className={styles.grid}>
						<Grid className={styles.title} item xs={4}></Grid>
						<Grid className={styles.value} item xs={4}>
							<StatusBadge label={longLabel} mode="success" />
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<StatusBadge label={shortLabel} mode="error" />
						</Grid>

						<Grid className={styles.title} item xs={4}>
							<p className={styles.column}>Funded</p>
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<LoadingValue isLoading={isFetching}>
								<BooleanBadge success={otcState.chainData.isLongFunded()} />
							</LoadingValue>
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<LoadingValue isLoading={isFetching}>
								<BooleanBadge success={otcState.chainData.isShortFunded()} />
							</LoadingValue>
						</Grid>

						<Grid className={styles.title} item xs={4}>
							<p className={styles.column}>{otcState.chainData.areBothSidesFunded() ? 'Deposited' : 'Required'}</p>
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<LoadingValue isLoading={isFetching}>
								<p>{formatWithDecimalDigits(otcState.chainData.buyerDepositAmount, -1)}</p>
							</LoadingValue>
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<LoadingValue isLoading={isFetching}>
								<p>{formatWithDecimalDigits(otcState.chainData.sellerDepositAmount, -1)}</p>
							</LoadingValue>
						</Grid>
						{livePriceIsInitialized && otcState.chainData.isPnlAvailable() && (
							<>
								<Grid className={styles.title} item xs={4}>
									<p className={styles.column}>{otcState.chainData.settleExecuted ? 'Final PnL' : 'Current PnL'}</p>
								</Grid>
								<Grid className={styles.value} item xs={4}>
									<LoadingValue isLoading={isFetching}>
										<p>{longPnlFormat}</p>
									</LoadingValue>
								</Grid>
								<Grid className={styles.value} item xs={4}>
									<LoadingValue isLoading={isFetching}>
										<p>{shortPnlFormat}</p>
									</LoadingValue>
								</Grid>
							</>
						)}
					</Grid>
				</Box>

				<div className={styles.buttons}>
					<DepositButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={true} />
					<DepositButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={false} />
					<WithdrawButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={true} />
					<WithdrawButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={false} />
					<SettleButton otcStatePubkey={otcState.chainData.publickey.toBase58()} />
					<ClaimButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={true} />
					<ClaimButton otcStatePubkey={otcState.chainData.publickey.toBase58()} isLong={false} />
				</div>
				{/* <div className={styles.buttons}>
					<ButtonPill mode="success" onClick={() => autoFundContractSide(otcState.chainData.publickey, 'long')} text="auto long" />
					<ButtonPill mode="error" onClick={() => autoFundContractSide(otcState.chainData.publickey, 'short')} text="auto short" />
				</div> */}
			</div>
			<Collapse in={showSimulator} orientation={'horizontal'}>
				<Simulator className={styles.simulator} chainData={otcState.chainData} />
			</Collapse>

			<ShareModal
				aliasId={otcState.aliasId}
				statusId={otcState.chainData.contractStatus}
				contractAddress={otcState.chainData.publickey.toBase58()}
				rateAddress={otcState.chainData.rateAccount.state.livePriceAccounts[0].toBase58()}
				open={openShare}
				handleClose={handleCloseShare}
			/>
		</div>
	);
};

export default ChainOtcStateDetails;

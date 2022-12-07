import { useEffect, useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Tooltip, Box, Grid, Collapse } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import BooleanBadge from 'components/atoms/BooleanBadge';
import ClickableIcon from 'components/atoms/ClickableIcon';
import LoadingValue from 'components/atoms/LoadingValue';
import StatusBadge from 'components/atoms/StatusBadge';
import TokenSymbol from 'components/atoms/TokenSymbol';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { OtcContract } from 'models/OtcContract';
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

export type ChainOtcStateDetailsInput = {
	otcState: OtcContract;
	isFetching: boolean;
	onRefetchClick: () => void;
};

const ChainOtcStateDetails = ({ otcState, isFetching, onRefetchClick }: ChainOtcStateDetailsInput) => {
	const wallet = useWallet();
	const router = useRouter();

	const aliasId = otcState?.aliasId ?? otcState.chainData.redeemLogicAccount.state.payoffId;

	const [longLabel, shortLabel] = getSidesLabelShort(aliasId);
	// const isOption = isOptionAlias(aliasId);

	const { create } = useContractStore();

	const cloneContract = () => {
		create({
			collateralMint: otcState.chainData.collateralMint.toBase58(),
			longDepositAmount: otcState.chainData.buyerDepositAmount,
			shortDepositAmount: otcState.chainData.sellerDepositAmount,
			depositStart: otcState.chainData.depositAvailableFrom,
			depositEnd: otcState.chainData.depositExpirationAt,
			settleStart: otcState.chainData.settleAvailableFromAt,
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

	return (
		<div className={styles.cards}>
			<div className={cn(styles.box, showSimulator && styles.changeEdge)}>
				<div className={styles.iconGroup}>
					<Box role="span" sx={{ display: 'inline-flex' }}>
						<ContractStatusBadge status={otcState.chainData.contractStatus} />
						<Tooltip title={'Open docs'} arrow placement="bottom">
							<a href={getPayoffDocumentionLink(otcState.chainData.redeemLogicAccount.state.payoffId)} target="_blank" rel="noopener noreferrer">
								<StatusBadge label={aliasId} mode="info" />
							</a>
						</Tooltip>
					</Box>
					<span>
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
										{isUsdQuote ? '$ ' : ''}
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

					{otcState.chainData.buyerWallet && wallet?.publicKey?.toBase58() === otcState.chainData.buyerWallet?.toBase58() && (
						<div className={styles.column}>
							<p>Your side</p>
							<p>
								<StatusBadge label={longLabel} mode="success" />
							</p>
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
								{/* TODO: fix decimal digits ref #380 */}
								<p>{otcState.chainData.buyerDepositAmount.toFixed(2).toString()}</p>
							</LoadingValue>
						</Grid>
						<Grid className={styles.value} item xs={4}>
							<LoadingValue isLoading={isFetching}>
								<p>{otcState.chainData.sellerDepositAmount.toFixed(2).toString()}</p>
							</LoadingValue>
						</Grid>
						{livePriceIsInitialized && otcState.chainData.isPnlAvailable() && (
							<>
								<Grid className={styles.title} item xs={4}>
									<p className={styles.column}>{otcState.chainData.settleExecuted ? 'Final PnL' : 'Current PnL'}</p>
								</Grid>
								<Grid className={styles.value} item xs={4}>
									<LoadingValue isLoading={isFetching}>
										<p>{formatWithDecimalDigits(otcState.chainData.getLongPnl(livePricesValue)).toFixed(2).toString()}</p>
									</LoadingValue>
								</Grid>
								<Grid className={styles.value} item xs={4}>
									<LoadingValue isLoading={isFetching}>
										<p>{formatWithDecimalDigits(otcState.chainData.getShortPnl(livePricesValue)).toFixed(2).toString()}</p>
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
			</div>
			<Collapse in={showSimulator} orientation={'horizontal'}>
				<Simulator className={styles.simulator} />
			</Collapse>
		</div>
	);
};

export default ChainOtcStateDetails;

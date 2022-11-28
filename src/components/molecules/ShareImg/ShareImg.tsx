import { Box } from '@mui/material';
import cn from 'classnames';
import { ChainOtcState } from 'models/ChainOtcState';

import styles from './ShareImg.module.scss';

type ShareImgProps = {
	otcState: ChainOtcState;

	livePricesValue?: number[];

	pov: 'long' | 'short';
};

const ShareImg = ({ otcState, livePricesValue, pov }: ShareImgProps) => {
	const pricesToUse = otcState.settleExecuted ? otcState.pricesAtSettlement : livePricesValue;
	const pnl =
		pov === 'long' ? otcState.getPnlBuyer(pricesToUse) / otcState.buyerDepositAmount : otcState.getPnlSeller(pricesToUse) / otcState.sellerDepositAmount;

	return (
		<div className={styles.card}>
			<div className={styles.content}>
				<span className={styles.leftContainer}>
					<div className={styles.protocolContainer}>
						<Box className={styles.logo} component={'img'} src={'/vyper-logo.png'} />
						<div className={styles.info}>
							<div className={styles.title}>Vyper OTC</div>
							<div className={styles.subtitle}>otc.vyperprotocol.io</div>
						</div>
					</div>
					<div className={styles.underlyingContainer}>
						<div className={styles.underlying}>{otcState.rateAccount.state.title}</div>
						<div className={cn(styles.chip, pov === 'long' ? styles.long : styles.short)}>
							<div className={styles.text}>{pov}</div>
						</div>
					</div>
					<div className={styles.pnlContainer}>
						<div className={styles.title}>PnL</div>
						<div className={cn(styles.pnl, pnl >= 0 ? styles.profit : styles.loss)}>{`${(pnl * 100).toFixed(2)}%`}</div>
					</div>
				</span>
				<span className={styles.rightContainer}>
					<div className={styles.payoffTypeContainer}>
						<div className={styles.payoffType}>{otcState.redeemLogicAccount.state.getTypeLabel()}</div>
					</div>
					<div className={styles.info}>
						<span className={styles.title}>Strike</span>
						{/* TODO: make more robust, not all have a strike */}
						<span className={styles.text}>{otcState.redeemLogicAccount.state.pluginDetails.find(({ label }) => label.toLowerCase() === 'strike').value}</span>
					</div>
					<div className={styles.info}>
						<span className={styles.title}>
							{otcState.settleExecuted
								? otcState.redeemLogicAccount.state.settlementPricesDescription[0]
								: otcState.redeemLogicAccount.state.rateFeedsDescription[0]}
						</span>
						<span className={styles.text}>{pricesToUse[0]}</span>
					</div>
				</span>
			</div>
		</div>
	);
};

export default ShareImg;

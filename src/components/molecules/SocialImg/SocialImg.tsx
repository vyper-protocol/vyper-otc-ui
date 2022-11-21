import { Box } from '@mui/material';
import styles from './SocialImg.module.scss';

const SocialImg = () => {
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
						<div className={styles.underlying}>SOL/USD</div>
						<div className={styles.chip}>
							<div className={styles.text}>SHORT</div>
						</div>
					</div>
					<div className={styles.pnlContainer}>
						<div className={styles.title}>PnL</div>
						<div className={styles.pnl}>+61.40%</div>
					</div>
				</span>
				<span className={styles.rightContainer}>
					<div className={styles.payoffTypeContainer}>
						<div className={styles.payoffType}>forward</div>
					</div>
					<div className={styles.info}>
						<span className={styles.title}>Strike</span>
						<span className={styles.text}>126.13</span>
					</div>
					<div className={styles.info}>
						<span className={styles.title}>Settlement price</span>
						<span className={styles.text}>25.94</span>
					</div>
				</span>
			</div>
		</div>
	);
};

export default SocialImg;

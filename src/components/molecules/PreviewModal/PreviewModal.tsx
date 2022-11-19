import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { OracleDetail } from 'models/OracleDetail';
import moment from 'moment';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { shortenString } from 'utils/stringHelpers';

import styles from './PreviewModal.module.scss';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

export type PreviewModalInput = {
	// redeem logic contract params
	redeemLogicOption: OtcInitializationParams['redeemLogicOption'];

	// end of the deposit period expressed in ms
	depositEnd: number;

	// contract expiry expressed in ms
	settleStart: number;

	// main rate plugin object
	ratePlugin1: OracleDetail;

	// secondary rate plugin object
	ratePlugin2: OracleDetail;

	seniorDepositAmount: number;

	juniorDepositAmount: number;

	// collateral mint
	reserveMint: string;

	// loading during contract creation
	isLoading: boolean;

	// on-chain contract create callback
	onCreateContractButtonClick: () => Promise<void>;
};

export const PreviewModal = ({
	redeemLogicOption,
	depositEnd,
	settleStart,
	ratePlugin1,
	ratePlugin2,
	seniorDepositAmount,
	juniorDepositAmount,
	reserveMint,
	isLoading,
	onCreateContractButtonClick
}: PreviewModalInput) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const { redeemLogicPluginType, strike, notional, isCall } = redeemLogicOption;

	const wallet = useWallet();
	const mintInfo = getMintByPubkey(reserveMint);

	const PreviewDescription = (
		<div className={styles.content}>
			<p className={styles.description}>
				You are creating a <span className={styles.highlight}>{redeemLogicPluginType}</span>{' '}
				{redeemLogicPluginType === 'vanilla_option' ||
					(redeemLogicPluginType === 'digital' && <span className={styles.highlight}>{isCall ? 'CALL' : 'PUT'}</span>)}{' '}
				contract on <span className={styles.highlight}>{ratePlugin1.title}</span>{' '}
				{redeemLogicPluginType === 'settled_forward' && (
					<span>
						{' '}
						settled using <span className={styles.highlight}>{ratePlugin2.title}</span>
					</span>
				)}{' '}
				with strike <span className={styles.highlight}>{formatWithDecimalDigits(strike, 6)}</span>
				{redeemLogicPluginType !== 'digital' && (
					<span>
						{' '}
						{'and notional'}{' '}
						<span className={styles.highlightNoCap}>
							{formatWithDecimalDigits(notional, 4)} {ratePlugin1.baseCurrency}
						</span>
					</span>
				)}
				{'.'}
			</p>
			{/* // TODO LONG/SHORT contextualized by payoff
			// TODO load onchain data for unknwon mints */}
			<p className={styles.description}>
				You selected{' '}
				{mintInfo && (
					<span>
						<span className={styles.highlightNoCap}>{mintInfo.title}</span> as collateral.
					</span>
				)}
				{!mintInfo && (
					<span>
						an unknown token as collateral, with token mint <span className={styles.highlight}>{shortenString(reserveMint)}</span>.
					</span>
				)}{' '}
				The LONG side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{seniorDepositAmount}
					{mintInfo && <span> {mintInfo.title}</span>}
				</span>{' '}
				while the SHORT side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{juniorDepositAmount}
					{mintInfo && <span> {mintInfo.title}</span>}
				</span>
				.
			</p>
			<p className={styles.description}>
				The deposit period will end in <span className={styles.highlight}>{moment(depositEnd).fromNow(true)}</span> and the contract will expire in{' '}
				<span className={styles.highlight}>{moment(settleStart).fromNow(true)}</span>.
			</p>

			<p className={styles.description}>
				The oracle provider is <span className={styles.highlight}>{ratePlugin1.type}</span>. The contract is being deployed on{' '}
				<span className={styles.highlight}>{getCurrentCluster()}</span>.
			</p>
		</div>
	);

	return (
		<Box>
			<Button sx={{ mt: 1, mr: 1 }} variant="contained" disabled={!wallet.connected || open} onClick={handleOpen}>
				{wallet.connected ? 'Preview' : 'Connect Wallet'}
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				PaperProps={{
					style: { borderRadius: 16 }
				}}
			>
				{' '}
				<div className={styles.content}>
					<DialogTitle className={styles.title}>Contract Summary</DialogTitle>
				</div>
				<DialogContent>{PreviewDescription}</DialogContent>
				<DialogActions sx={{ px: 4, mb: 2, mt: -2 }}>
					<Button onClick={handleClose}>Cancel</Button>
					<LoadingButton variant="contained" loading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
						{wallet.connected ? 'Create 🚀' : 'Connect Wallet'}
					</LoadingButton>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

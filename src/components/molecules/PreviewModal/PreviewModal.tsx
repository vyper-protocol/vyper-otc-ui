import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import Modal from 'components/atoms/Modal';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { MintDetail } from 'models/MintDetail';
import { OracleDetail } from 'models/OracleDetail';
import moment from 'moment';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { shortenString } from 'utils/stringHelpers';

import styles from './PreviewModal.module.scss';

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
	reserveMint: MintDetail;

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

	const PreviewDescription = (
		<div className={styles.content}>
			<p className={styles.description}>
				You are creating a <span className={styles.highlight}>{redeemLogicPluginType}</span>{' '}
				{redeemLogicPluginType === 'vanilla_option' ||
					(redeemLogicPluginType === 'digital' && <span className={styles.highlight}>{isCall ? 'CALL' : 'PUT'}</span>)}{' '}
				contract on <span className={styles.highlightNoCap}>{ratePlugin1.title}</span> with strike{' '}
				<span className={styles.highlight}>{formatWithDecimalDigits(strike, 6)}</span>
				{redeemLogicPluginType !== 'digital' && (
					<span>
						{' '}
						{'and notional'}{' '}
						<span className={styles.highlightNoCap}>
							{formatWithDecimalDigits(notional, 4)} {ratePlugin1.baseCurrency}
						</span>
					</span>
				)}
				{'.'}{' '}
				{redeemLogicPluginType === 'settled_forward' && (
					<span>
						{' '}
						The contract will be settled using <span className={styles.highlightNoCap}>{ratePlugin2.title}.</span>
					</span>
				)}{' '}
			</p>
			{/* // TODO: LONG/SHORT contextualized by payoff
			// TODO: load onchain data for unknwon mints , checks are not useful for now*/}
			<p className={styles.description}>
				The contract will be settled in{' '}
				{reserveMint && (
					<span>
						<span className={styles.highlightNoCap}>{reserveMint.title}</span>.
					</span>
				)}
				{!reserveMint && (
					<span>
						an unknown token, with token mint <span className={styles.highlight}>{shortenString(reserveMint.pubkey)}</span>.
					</span>
				)}{' '}
				The <span className={styles.highlight}>long</span> side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{seniorDepositAmount}
					{reserveMint && <span> {reserveMint.title}</span>}
				</span>{' '}
				while the <span className={styles.highlight}>short</span> side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{juniorDepositAmount}
					{reserveMint && <span> {reserveMint.title}</span>}
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
		<div>
			<Button sx={{ mt: 1, mr: 1 }} variant="contained" disabled={!wallet.connected || open} onClick={handleOpen}>
				{wallet.connected ? 'Preview' : 'Connect Wallet'}
			</Button>
			<Modal
				title={'Contract Summary'}
				open={open}
				handleClose={handleClose}
				contentProps={PreviewDescription}
				actionProps={
					<LoadingButton variant="contained" loading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
						{wallet.connected ? 'Create 🚀' : 'Connect Wallet'}
					</LoadingButton>
				}
			/>
		</div>
	);
};

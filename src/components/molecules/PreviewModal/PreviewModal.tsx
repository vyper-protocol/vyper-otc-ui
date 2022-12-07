import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import { fetchTokenInfoCached } from 'api/next-api/fetchTokenInfo';
import Modal from 'components/atoms/Modal';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { MintDetail } from 'models/MintDetail';
import moment from 'moment';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import { shortenString } from 'utils/stringHelpers';

import styles from './PreviewModal.module.scss';

export type PreviewModalInput = {
	// redeem logic contract params
	redeemLogicOption: OtcInitializationParams['redeemLogicOption'];

	// rate contract params
	rateOption: OtcInitializationParams['rateOption'];

	// end of the deposit period expressed in ms
	depositEnd: number;

	// contract expiry expressed in ms
	settleStart: number;

	// long deposit amount
	longDepositAmount: number;

	// short deposit amount
	shortDepositAmount: number;

	// collateral mint
	collateralMint: string;

	// open state of the modal
	open: boolean;

	// handle close of the modal
	handleClose: () => void;

	// actions of the modal
	actionProps: JSX.Element;
};

export const PreviewModal = ({
	redeemLogicOption,
	rateOption,
	depositEnd,
	settleStart,
	longDepositAmount,
	shortDepositAmount,
	collateralMint,
	open,
	handleClose,
	actionProps
}: PreviewModalInput) => {
	const { redeemLogicPluginType, strike, notional, isCall } = redeemLogicOption;

	const [mintDetail, setMintDetail] = useState<MintDetail | undefined>(undefined);
	useEffect(() => {
		try {
			const mint = getMintByPubkey(collateralMint);
			if (mint) {
				// pubkey is in mapped list
				setMintDetail(mint);
			} else {
				// pubkey isn't mapped, look for it on chain
				fetchTokenInfoCached(new PublicKey(collateralMint)).then((tokenInfo) => {
					setMintDetail({
						cluster: getCurrentCluster(),
						pubkey: collateralMint,
						title: tokenInfo.symbol
					});
				});
			}
		} catch {
			setMintDetail(undefined);
		}
	}, [collateralMint]);

	const PreviewDescription = (
		<div className={styles.content}>
			<p className={styles.description}>
				You are creating a <span className={styles.highlight}>{redeemLogicPluginType}</span>{' '}
				{redeemLogicPluginType === 'vanilla_option' ||
					(redeemLogicPluginType === 'digital' && <span className={styles.highlight}>{isCall ? 'CALL' : 'PUT'}</span>)}{' '}
				contract on <span className={styles.highlightNoCap}>{getOracleByPubkey(rateOption.rateAccounts[0])?.title}</span> with strike{' '}
				<span className={styles.highlight}>{formatWithDecimalDigits(strike, 6)}</span>
				{redeemLogicPluginType !== 'digital' && (
					<span>
						{' '}
						{'and notional'}{' '}
						<span className={styles.highlightNoCap}>
							{formatWithDecimalDigits(notional, 4)} {getOracleByPubkey(rateOption.rateAccounts[0])?.baseCurrency}
						</span>
					</span>
				)}
				{'.'}{' '}
				{redeemLogicPluginType === 'settled_forward' && rateOption.rateAccounts.length > 1 && (
					<span>
						{' '}
						The contract will be settled using <span className={styles.highlightNoCap}>{getOracleByPubkey(rateOption.rateAccounts[1])?.title}.</span>
					</span>
				)}{' '}
			</p>
			{/* // TODO: LONG/SHORT contextualized by payoff
			// TODO: load onchain data for unknwon mints , checks are not useful for now*/}
			<p className={styles.description}>
				The contract will be settled in{' '}
				{collateralMint && (
					<span>
						<span className={styles.highlightNoCap}>{mintDetail?.title}</span>.
					</span>
				)}
				{!collateralMint && (
					<span>
						an unknown token, with token mint <span className={styles.highlight}>{shortenString(collateralMint)}</span>.
					</span>
				)}{' '}
				The <span className={styles.highlight}>long</span> side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{longDepositAmount}
					{collateralMint && <span> {mintDetail?.title}</span>}
				</span>{' '}
				while the <span className={styles.highlight}>short</span> side will need to deposit{' '}
				<span className={styles.highlightNoCap}>
					{shortDepositAmount}
					{collateralMint && <span> {mintDetail?.title}</span>}
				</span>
				.
			</p>
			<p className={styles.description}>
				The deposit period will end in <span className={styles.highlight}>{moment(depositEnd).fromNow(true)}</span> and the contract will expire in{' '}
				<span className={styles.highlight}>{moment(settleStart).fromNow(true)}</span>.
			</p>

			<p className={styles.description}>
				The oracle provider is <span className={styles.highlight}>{rateOption.ratePluginType}</span>. The contract is being deployed on{' '}
				<span className={styles.highlight}>{getCurrentCluster()}</span>.
			</p>

			<p className={styles.description}>
				Vyper charges no fees for using the service. The contract has a Solana rent fee of <span className={styles.highlight}>~0.03 SOL</span> payed on
				transaction submit.
			</p>
		</div>
	);

	return (
		<div>
			<Modal title={'Contract Summary'} open={open} handleClose={handleClose} contentProps={PreviewDescription} actionProps={actionProps} />
		</div>
	);
};

import { useContext, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import FeaturedProduct from 'components/FeaturedProduct';
import LoadingValue from 'components/LoadingValue';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './BonkFixedPayout.module.scss';

// TODO reuse make FeaturedFixedPayout more reusable

const formatSmallNumber = (n: number): string => {
	return n.toPrecision(4);
};

const ActionPanel = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const oracleDetail = getOracleByPubkey('GnL9fGrXVSMyEeoGtrmPzjEaw9JdbNpioQkJj6wfcscY');
	const mintDetail = getMintByPubkey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');

	const [isLoading, setIsLoading] = useState(false);
	const longDepositAmount = 1_000_000;

	const { pricesValue, isInitialized } = useOracleLivePrice(oracleDetail.type, [oracleDetail.pubkey]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				...DEFAULT_INIT_PARAMS,

				depositEnd: moment().add(15, 'minutes').toDate().getTime(),
				settleStart: moment().add(30, 'minutes').toDate().getTime(),

				longDepositAmount,
				shortDepositAmount: longDepositAmount * 2,
				aliasId: 'digital',
				payoffOption: {
					payoffId: 'digital',
					strike: pricesValue[0],
					isCall: true
				},

				rateOption: {
					ratePluginType: oracleDetail.type,
					rateAccounts: [oracleDetail.pubkey]
				},
				collateralMint: mintDetail.pubkey
				// collateralMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
			};

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams, 'long');

			// Create contract URL
			router.push(UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58()));
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box sx={{ alignItems: 'center', maxWidth: '45vw' }} className={cn(styles.container, styles.actionGroup)}>
			<Typography variant="h5">
				Make 2x if the price of <span className={styles.highlight}>{oracleDetail.title}</span> is above{' '}
				<LoadingValue isLoading={!isInitialized}>
					<span className={styles.highlight}>${isInitialized && formatSmallNumber(pricesValue[0])}</span>
				</LoadingValue>{' '}
				in <span className={styles.highlight}>{30} minutes</span>
			</Typography>
			<br />
			<Typography sx={{ fontSize: '1.5em' }} variant="body1">
				Bet <b>1,000,000 BONK</b> that BONK/USD will be <b>above</b>{' '}
				<LoadingValue isLoading={!isInitialized}>
					<span className={styles.highlight}>${isInitialized && formatSmallNumber(pricesValue[0])}</span>
				</LoadingValue>{' '}
				in 30 minutes.
				<br />
				<br />
				If BONK/USD is <b>above</b> you <span className={styles.profit}>win 2,000,000 BONK</span> 🤑
				<br />
				If BONK/USD is <b>below</b> you <span className={styles.loss}>lose 1,000,000 BONK</span>
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center', mt: 3 }}>
				<LoadingButton
					className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
					loading={isLoading}
					variant="contained"
					disabled={!wallet.connected}
					onClick={onCreateContractButtonClick}
					size="large"
				>
					{wallet.connected ? 'BUY NOW' : 'Connect wallet'}
				</LoadingButton>
			</Box>
		</Box>
	);
};

const BonkFixedPayout = () => {
	return (
		<FeaturedProduct pageTitle={'BONK'} image={'/bonk-logo.png'}>
			<Box>
				<div className={styles.title}>
					<h1>{'BONK 2x in 30 minutes'}</h1>
				</div>

				<ActionPanel />
			</Box>
		</FeaturedProduct>
	);
};

export default BonkFixedPayout;

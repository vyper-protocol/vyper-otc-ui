import { useContext, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Typography, ToggleButton } from '@mui/material';
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
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './BonkFixedPayout.module.scss';

// TODO reuse make FeaturedFixedPayout more reusable

const ActionPanel = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const oracleDetail = getOracleByPubkey('GnL9fGrXVSMyEeoGtrmPzjEaw9JdbNpioQkJj6wfcscY');
	const mintDetail = getMintByPubkey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');

	const [isLoading, setIsLoading] = useState(false);
	const [longDepositAmount, setLongDepositAmount] = useState(1000000);

	const settleStart = moment().add(1, 'hour');
	const settleLabel = settleStart.format('DD MMM YYYY - hh:mm A');

	const pillars = [1000000];

	const maxGain = new Intl.NumberFormat('en-US').format(longDepositAmount * 2);
	const maxLoss = new Intl.NumberFormat('en-US').format(longDepositAmount);

	const { pricesValue, isInitialized } = useOracleLivePrice(oracleDetail.type, [oracleDetail.pubkey]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				...DEFAULT_INIT_PARAMS,

				depositEnd: moment().add(5, 'minutes').toDate().getTime(),
				settleStart: moment().add(1, 'hour').toDate().getTime(),

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
			<Typography variant="h6">
				Make 2x if the price of <span className={styles.highlight}>{oracleDetail.title}</span> is above{' '}
				<LoadingValue isLoading={!isInitialized}>
					<span className={styles.highlight}>${formatWithDecimalDigits(pricesValue[0], 4)}</span>
				</LoadingValue>{' '}
				on <span className={styles.highlight}>{settleLabel}</span>
			</Typography>
			<br />
			<Typography variant="body1">
				With this instrument you can get a <b>fixed payout</b> (2x the invested amount) when the <b>market price</b> of {oracleDetail.title}{' '}
				<b>is greater than</b> the <b>spot price</b> within the next 60 minutes.
				<br />
				<br />
				The maximum <b>gain</b> is <b>{maxGain} BONK</b>
				<br />
				The maximum <b>loss</b> is <b>{maxLoss} BONK</b>
			</Typography>
			<hr />
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center' }}>
				<Box sx={{ display: 'inline-flex', height: 24 }}>
					{pillars.map((pillarValue, i) => (
						<ToggleButton
							key={i}
							value={pillarValue}
							color="primary"
							sx={{
								fontSize: 18,
								p: 2,
								mx: 1
							}}
							size="large"
							fullWidth={true}
							selected={pillarValue === longDepositAmount}
							onChange={(_e, v) => setLongDepositAmount(v)}
						>
							{`${pillarValue} BONK`}
						</ToggleButton>
					))}
				</Box>

				<Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
					<LoadingButton
						className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
						loading={isLoading}
						variant="contained"
						disabled={!wallet.connected}
						onClick={onCreateContractButtonClick}
					>
						{wallet.connected ? 'BUY' : 'Connect wallet'}
					</LoadingButton>
				</Box>
			</Box>

			<hr />

			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
				<Box>
					<div className={styles.profit}>{maxGain} BONK</div>
					<span className={styles.caption}>max gain</span>
				</Box>
				<Box>
					<div className={styles.loss}>{maxLoss} BONK</div>
					<span className={styles.caption}>max loss</span>
				</Box>
			</Box>
		</Box>
	);
};

const BonkFixedPayout = () => {
	return (
		<FeaturedProduct pageTitle={'BONK'} image={'/bonk-logo.png'}>
			<Box>
				<div className={styles.title}>
					<h1>{'BONK 2x'}</h1>
				</div>

				<ActionPanel />
			</Box>
		</FeaturedProduct>
	);
};

export default BonkFixedPayout;

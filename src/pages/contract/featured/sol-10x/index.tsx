/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, CircularProgress, ToggleButton, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import FeaturedProduct from 'components/FeaturedProduct';
import LoadingValue from 'components/LoadingValue';
import NumericField from 'components/NumericField';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { useRouter } from 'next/router';
import { sleep } from 'utils/sleep';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './index.module.scss';

const ActionPanel = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const pillars = [1, 10, 50];

	const [isLoading, setIsLoading] = useState(false);
	const [longDepositAmount, setLongDepositAmount] = useState(pillars[0]);

	const settleStart = moment().add(1, 'week');
	const settleLabel = settleStart.format('DD MMM YYYY - hh:mm A');

	const [rfqLoading, setRfqLoading] = useState(false);
	const { pricesValue, isInitialized } = useOracleLivePrice('pyth', DEFAULT_INIT_PARAMS.rateOption.rateAccounts);

	// const refStrike = () => BSDigitalStrike(pricesValue[0], 0, 0.85, 7 / 365, true, 0.1);
	// FIXME
	const refStrike = () => pricesValue[0] * 1.15;

	const [rfqStrike, setRfqStrike] = useState(0);
	const [rfqProgress, setRfqProgress] = useState(0);

	const onRfqButtonClick = async () => {
		setRfqLoading(true);

		// needed to update color on loading
		setRfqProgress(0);

		try {
			await sleep(1500);
			setRfqStrike(refStrike());
		} finally {
			setRfqProgress(0);
			setRfqLoading(false);
		}
	};

	useEffect(() => {
		if (isInitialized) {
			setRfqStrike(refStrike());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized]);

	useEffect(() => {
		const timer = setInterval(() => {
			setRfqProgress((oldProgress) => {
				// 30s timer updated every 0.5s
				return Math.min(100, oldProgress + 100 / 60);
			});
		}, 500);

		return () => {
			clearInterval(timer);
		};
	}, []);

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				...DEFAULT_INIT_PARAMS,

				depositEnd: moment().add(5, 'minutes').toDate().getTime(),
				settleStart: settleStart.toDate().getTime(),

				longDepositAmount,
				shortDepositAmount: longDepositAmount * 10,
				aliasId: 'digital',
				payoffOption: {
					payoffId: 'digital',
					strike: rfqStrike,
					isCall: true
				}
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
		<Box sx={{ alignItems: 'center', maxWidth: '50vw' }} className={cn(styles.container, styles.actionGroup)}>
			<Typography variant="h6">
				Make 10x if the price of <b>SOL/USD</b> is above <LoadingValue isLoading={rfqLoading || !isInitialized}>${rfqStrike.toFixed(4)}</LoadingValue> on{' '}
				{settleLabel}
			</Typography>
			<br />
			<Typography variant="body1">
				With this instrument you can get a <b>fixed payout</b> (10x the invested amount) when the <b>market price</b> (
				<LoadingValue isLoading={!isInitialized}>${pricesValue[0]?.toFixed(4)}</LoadingValue>) of the underlying asset (SOL/USD) <b>is greater than</b> the{' '}
				<b>strike price</b> (<LoadingValue isLoading={rfqLoading}>${rfqStrike.toFixed(4)}</LoadingValue>) within a given time ({settleLabel}).
				<br />
				<br />
				The maximum <b>gain</b> is <b>10x</b> the invested amount
				<br />
				The maximum <b>loss</b> is the invested amount
			</Typography>
			<hr />
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%', alignItems: 'center' }}>
				<Box sx={{ display: 'inline-flex', height: 24 }}>
					{pillars.map((pillarValue, i) => (
						<ToggleButton
							key={i}
							value={pillarValue}
							sx={{
								textTransform: 'none',
								fontSize: 12,
								py: 0.5,
								px: 1.5,
								mx: 0.5
							}}
							size="small"
							fullWidth={true}
							selected={pillarValue === longDepositAmount}
							onChange={(_e, v) => setLongDepositAmount(v)}
						>
							{`$${pillarValue}`}
						</ToggleButton>
					))}
				</Box>
				<Box>
					<Box>
						<NumericField label="Choose your amount" value={longDepositAmount} onChange={setLongDepositAmount} />
					</Box>
				</Box>
				<Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
					<LoadingButton
						className={cn(styles.button, rfqProgress === 100 ? styles.refresh : styles.buy)}
						loading={isLoading}
						variant="contained"
						disabled={!wallet.connected || rfqLoading}
						onClick={rfqProgress === 100 ? onRfqButtonClick : onCreateContractButtonClick}
					>
						{wallet.connected ? (rfqProgress === 100 ? 'Refresh quote' : rfqLoading ? 'Refreshing' : 'Buy now') : 'Connect wallet'}
					</LoadingButton>
					<Box className={cn(!wallet.connected ? styles.hidden : '')} sx={{ position: 'relative', display: 'inline-flex', ml: 1 }}>
						<CircularProgress
							className={cn(styles.progress, rfqProgress > 75 ? styles.rush : '')}
							variant={rfqLoading ? 'indeterminate' : 'determinate'}
							value={rfqProgress}
							color="inherit"
							size={'1.2em'}
						/>
						<div className={cn(styles.background, rfqProgress > 75 ? styles.background_rush : '')}>
							<CircularProgress
								variant="determinate"
								value={100}
								color="inherit"
								size={'1.2em'}
								sx={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									position: 'absolute'
								}}
							/>
						</div>
					</Box>
				</Box>
			</Box>

			<hr />

			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
				<Box>
					<div className={styles.profit}>${longDepositAmount * 10}</div>
					<span className={styles.caption}>max gain</span>
				</Box>
				<Box>
					<div className={styles.loss}>${longDepositAmount}</div>
					<span className={styles.caption}>max loss</span>
				</Box>
			</Box>
		</Box>
	);
};

const CreateSol10xPage = () => {
	return (
		<FeaturedProduct pageTitle={'SOL 10x'} title={'SOL 10x weekly call'} symbol={'SOLUSD'}>
			<ActionPanel />
		</FeaturedProduct>
	);
};

export default CreateSol10xPage;

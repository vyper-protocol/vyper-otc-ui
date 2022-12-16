/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, LinearProgress, ToggleButton, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import FeaturedProduct from 'components/FeaturedProduct';
import LoadingValue from 'components/LoadingValue';
import MomentTooltipSpan from 'components/MomentTooltipSpan';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import TradingViewChart from 'components/TradingViewChart';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { useRouter } from 'next/router';
import { BSDigitalStrike } from 'utils/blackScholes';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './index.module.scss';

const ActionPanel = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);
	const [longDepositAmount, setLongDepositAmount] = useState(5);

	const pillars = [5, 10, 25, 50, 100];

	const refSettle = () => moment().add(1, 'hour').toDate().getTime();

	const [settleStart, setSettleStart] = useState(refSettle());

	const [rfqLoading, setRfqLoading] = useState(false);
	const [showRfq, setShowRfq] = useState(false);
	const [rfqStrike, setRfqStrike] = useState(0);
	const [rfqProgress, setRfqProgress] = useState(0);

	const { pricesValue, isInitialized } = useOracleLivePrice('pyth', DEFAULT_INIT_PARAMS.rateOption.rateAccounts);

	const onRfqButtonClick = () => {
		// reset color
		setRfqProgress(100);
		setRfqLoading(true);
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			if (rfqLoading) {
				setSettleStart(refSettle());
				setRfqStrike(BSDigitalStrike(pricesValue[0], 0, 3.5, 1 / 24 / 365, true, 0.1));
				if (!showRfq) {
					setShowRfq(true);
				}
				setRfqProgress(100);
				setRfqLoading(false);
			}
		}, 1500);

		return () => clearTimeout(timer);
	}, [showRfq, rfqLoading, pricesValue]);

	useEffect(() => {
		const timer = setInterval(() => {
			setRfqProgress((oldProgress) => {
				if (oldProgress === 0) {
					return 0;
				}

				// 60s timer updated every 0.5s
				return Math.max(0, oldProgress - 100 / 120);
			});
		}, 500);

		return () => {
			clearInterval(timer);
		};
	}, [rfqProgress]);

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
				settleStart,

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
		<Box sx={{ alignItems: 'center' }} className={cn(styles.container, styles.actionGroup)}>
			<h6>How much you want to bet?</h6>
			<Box sx={{ width: '80%', display: 'inline-flex', alignContent: 'center' }}>
				{pillars.map((pillarValue, i) => (
					<ToggleButton
						key={i}
						value={pillarValue}
						sx={{
							textTransform: 'none',
							fontSize: 12,
							py: 0.5,
							px: 1.5,
							margin: 0,
							border: 'none',
							'&.Mui-disabled': {
								border: 0
							},
							'&:not(:first-of-type)': {
								borderRadius: 1
							}
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
			<Typography sx={{ my: 1.5 }}>
				<b>Live price</b>: <LoadingValue isLoading={!isInitialized}>{pricesValue[0]?.toFixed(4)}</LoadingValue>
			</Typography>
			<LoadingButton loading={rfqLoading} variant="contained" onClick={onRfqButtonClick}>
				{showRfq ? 'Refresh quote' : 'Request Quote'}
			</LoadingButton>

			{showRfq && (
				<>
					<Box className={cn(styles.progress, rfqProgress < 25 ? styles.rush : '')}>
						<LinearProgress variant={rfqLoading ? 'indeterminate' : 'determinate'} value={rfqProgress} color="inherit" />
					</Box>

					<Box className={styles.descriptionGroup}>
						<div>
							<b>Expiry</b>: <MomentTooltipSpan datetime={settleStart} />
						</div>

						<Box sx={{ display: 'inline-flex' }}>
							<b>Max gain</b>:
							<Box role="span" sx={{ px: 0.5 }} className={styles.profit}>
								${longDepositAmount * 10}
							</Box>{' '}
							if SOL/USD {'>'}{' '}
							<LoadingValue isLoading={rfqLoading}>
								<Box role="span">{rfqStrike.toFixed(4)}</Box>
							</LoadingValue>
						</Box>

						<Box sx={{ display: 'inline-flex' }}>
							<b>Max loss</b>:
							<Box role="span" sx={{ px: 0.5 }} className={styles.loss}>
								${longDepositAmount}
							</Box>{' '}
							if SOL/USD {'<'}{' '}
							<LoadingValue isLoading={rfqLoading}>
								<Box role="span">{rfqStrike.toFixed(4)}</Box>
							</LoadingValue>
						</Box>
					</Box>

					<LoadingButton
						loading={isLoading}
						variant="contained"
						disabled={!wallet.connected || rfqLoading || rfqProgress === 0}
						onClick={onCreateContractButtonClick}
					>
						{wallet.connected ? '10x 🚀' : 'Connect wallet'}
					</LoadingButton>
				</>
			)}
		</Box>
	);
};

const CreateSol10xPage = () => {
	return (
		<FeaturedProduct pageTitle={'SOL 10x'} title={'SOL 10x in one click'}>
			<Box sx={{ width: '65vw' }}>
				<TradingViewChart symbol="SOLUSD" />
			</Box>
			<ActionPanel />
		</FeaturedProduct>
	);
};

export default CreateSol10xPage;

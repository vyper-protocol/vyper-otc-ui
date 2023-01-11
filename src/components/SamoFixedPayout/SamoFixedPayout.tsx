import { useContext, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Collapse, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import LoadingValue from 'components/LoadingValue';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import TradingViewSymbol from 'components/TradingViewSymbol';
import { createDefaultInitParams } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { useRouter } from 'next/router';
import { BSDigitalStrike } from 'utils/blackScholes';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './SamoFixedPayout.module.scss';

const ActionPanel = () => {
	const oracleDetail = getOracleByPubkey('AJCnhHbBc1L3ULfeVkdnXep4rUyWXQC55CZuUUgCjzbG');
	const mintDetail = getMintByPubkey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');

	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isCall, setIsCall] = useState(true);
	const { pricesValue, isInitialized } = useOracleLivePrice(oracleDetail.type, [oracleDetail.pubkey]);
	const [isLoading, setIsLoading] = useState(false);

	const [longDepositAmount, setLongDepositAmount] = useState(1_000);
	const [multiplier, setMultiplier] = useState(2);
	const [expiry, setExpiry] = useState(30);

	const shortDepositAmount = longDepositAmount * multiplier;
	const [strike, setStrike] = useState(0);

	const [open, setOpen] = useState(true);

	useEffect(() => {
		if (isInitialized) {
			setStrike(BSDigitalStrike(pricesValue[0], 0, 2, expiry / 60 / 24 / 365, isCall, 1 / multiplier));
		}
	}, [isInitialized, pricesValue, isCall, expiry, multiplier]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				...createDefaultInitParams(),

				depositEnd: moment()
					.add(expiry - 1, 'minutes')
					.toDate()
					.getTime(),
				settleStart: moment().add(expiry, 'minutes').toDate().getTime(),

				longDepositAmount,
				shortDepositAmount: longDepositAmount * multiplier,
				aliasId: 'digital',
				payoffOption: {
					payoffId: 'digital',
					strike: strike,
					isCall: isCall
				},

				rateOption: {
					ratePluginType: oracleDetail.type,
					rateAccounts: [oracleDetail.pubkey]
				},
				collateralMint: mintDetail.pubkey
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
		<Box sx={{ display: 'flex', width: '100%', mt: 1, justifyContent: 'center', height: '90vh' }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, px: 16 }} className={styles.container}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0 }}>
					<Typography
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							fontWeight: 300,
							justifyContent: 'center',
							paddingBottom: '0px',
							paddingTop: '0px'
						}}
					>
						<Box component="img" src="/samo-logo.png" alt="logo" sx={{ width: '10%' }} />
					</Typography>
					{/* <Typography sx={{ fontWeight: 500, justifyContent: 'center', paddingBottom: '10px', paddingTop: '0px' }} variant="h6">
						🐍 by VYPER OTC 🐍
					</Typography> */}
					<Box className={styles.glow} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 6 }}>
						<Typography sx={{ fontWeight: 500 }} variant="h6">
							I think SAMO is going {isCall ? '⬆️' : '⬇️'}
						</Typography>
						<ToggleButtonGroup
							className={styles.button_group}
							value={isCall}
							exclusive
							onChange={(_e, v) => {
								if (v !== null) {
									setIsCall(v);
								}
							}}
						>
							{['UP', 'DOWN'].map((v, i) => (
								<ToggleButton
									className={cn(styles.button, v === 'UP' ? styles.profit : styles.loss)}
									key={i}
									disableRipple
									value={v === 'UP'}
									size="small"
									sx={{ mx: 1.5 }}
								>
									{v}
								</ToggleButton>
							))}
						</ToggleButtonGroup>

						<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6">
							Trade Amount 💰
						</Typography>
						<ToggleButtonGroup
							className={styles.button_group}
							value={longDepositAmount}
							exclusive
							onChange={(_e, v) => {
								if (v !== null) {
									setLongDepositAmount(v);
								}
							}}
						>
							{[250, 500, 1000].map((v, i) => (
								<ToggleButton className={cn(styles.button, styles.second)} key={i} disableRipple value={v} size="small" sx={{ mx: 1.5 }}>
									{v.toLocaleString()}
								</ToggleButton>
							))}
						</ToggleButtonGroup>

						<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6">
							Multiplier 🔢
						</Typography>
						<ToggleButtonGroup
							className={styles.button_group}
							value={multiplier}
							exclusive
							onChange={(_e, v) => {
								if (v !== null) {
									setMultiplier(v);
								}
							}}
						>
							{[2, 5, 10].map((v, i) => (
								<ToggleButton className={cn(styles.button, styles.third)} key={i} disableRipple value={v} size="small" sx={{ mx: 1.5 }}>
									{v}x
								</ToggleButton>
							))}
						</ToggleButtonGroup>

						<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6">
							Expiry ⏰
						</Typography>
						<ToggleButtonGroup
							className={styles.button_group}
							value={expiry}
							exclusive
							onChange={(_e, v) => {
								if (v !== null) {
									setExpiry(v);
								}
							}}
						>
							{[30, 60, 120].map((v, i) => (
								<ToggleButton className={cn(styles.button, styles.fourth)} key={i} disableRipple value={v} size="small" sx={{ mx: 1.5 }}>
									{v} min
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Box>
					<Box>
						<Typography sx={{ mt: 1, fontWeight: 400, textTransform: 'uppercase' }} variant="h6" align="center">
							win if SAMO is {isCall ? 'above' : 'below'}{' '}
							<LoadingValue isLoading={!isInitialized}>
								<span className={styles.highlight}>${isInitialized && formatWithDecimalDigits(strike, 4)}</span>
							</LoadingValue>{' '}
							in {expiry} minutes
							<br />
							<b>{isCall ? 'above' : 'below'}</b> 👉🏻 <span className={styles.profit}> +{shortDepositAmount.toLocaleString()} SAMO</span> 🤑
							<br />
							<b>{isCall ? 'below' : 'above'}</b> 👉🏻 <span className={styles.loss}> -{longDepositAmount.toLocaleString()} SAMO</span> 💸
						</Typography>
					</Box>
					<LoadingButton
						sx={{ mt: 2, borderRadius: 4 }}
						className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
						loading={isLoading}
						variant="contained"
						disabled={!wallet.connected}
						onClick={onCreateContractButtonClick}
						size="large"
					>
						{wallet.connected ? 'Trade Now' : 'Connect wallet'}
					</LoadingButton>
					<Collapse in={open}>
						<Alert
							sx={{ mt: 1 }}
							severity="info"
							onClose={() => {
								setOpen(false);
							}}
						>
							You will pay {longDepositAmount.toLocaleString()} SAMO 🐕 from your wallet to enter the trade.
						</Alert>
					</Collapse>
				</Box>
			</Box>
			<Box sx={{ mt: 2 }}>{/* CHART GOES HERE */}</Box>
		</Box>
	);
};

const Chart = () => (
	<Box sx={{ width: '60vw', height: '500px' }}>
		<TradingViewSymbol symbol="OKX:SAMOUSDT" />
	</Box>
);

const SamoFixedPayout = () => {
	return (
		<Box sx={{ width: '100%', height: '100%' }}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<ActionPanel />
				</Grid>
				<Grid item xs={12} md={6}>
					<Chart />
				</Grid>
			</Grid>
		</Box>
	);
};

export default SamoFixedPayout;

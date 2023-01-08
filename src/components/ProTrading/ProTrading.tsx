// react div hello world example

import { LoadingButton } from '@mui/lab';
import { Box, Button, createTheme, CssBaseline, Slider, ThemeProvider, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import SelectWallet from 'components/SelectWallet';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { BSDigitalStrike } from 'utils/blackScholes';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './ProTrading.module.scss';
import LoadingValue from 'components/LoadingValue';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

const darkTheme = createTheme({
	palette: {
		mode: 'dark'
	}
});

const ProPage = () => {
	const oracleDetail = getOracleByPubkey('GnL9fGrXVSMyEeoGtrmPzjEaw9JdbNpioQkJj6wfcscY');
	const mintDetail = getMintByPubkey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');

	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isCall, setIsCall] = useState(true);
	const { pricesValue, isInitialized } = useOracleLivePrice(oracleDetail.type, [oracleDetail.pubkey]);
	const [isLoading, setIsLoading] = useState(false);

	const [longDepositAmount, setLongDepositAmount] = useState(1_000_000);
	const [multiplier, setMultiplier] = useState(2);
	const shortDepositAmount = longDepositAmount * multiplier;
	const [expiry, setExpiry] = useState(30);
	const [strike, setStrike] = useState(0);

	const [showPreview, setShowPreview] = useState(false);
	const [showConfirmTrade, setShowConfirmTrade] = useState(false);

	const multiplierOptions = { 2: 0.01, 5: 0.06, 10: 0.12 };
	const strikeAdjustment = multiplierOptions[multiplier];

	useEffect(() => {
		setStrike(BSDigitalStrike(pricesValue[0], 0, 7, expiry / 60 / 24 / 365, isCall, 1 / multiplier) * (isCall ? 1.015 : 0.985));
	}, [isInitialized, pricesValue, isCall, expiry, multiplier]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				...DEFAULT_INIT_PARAMS,

				depositEnd: moment().add(15, 'minutes').toDate().getTime(),
				settleStart: moment().add(30, 'minutes').toDate().getTime(),

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
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Box className={styles.container}>
				<Typography color="textPrimary">{!wallet.connected ? 'Connnect to trade' : 'Personal Account'}</Typography>
				<SelectWallet />
				{/* <LoadingButton
				sx={{ mt: 2 }}
				className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
				disabled={!wallet.connected}
				loading={isLoading}
				variant="contained"
				onClick={onCreateContractButtonClick}
				size="large"
			>
				{wallet.connected ? 'Trade Now' : 'Connect to trade'}
			</LoadingButton> */}
				<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6" color="textPrimary">
					Trade Amount
				</Typography>
				<ToggleButtonGroup
					sx={{ mt: 1 }}
					value={longDepositAmount}
					exclusive
					onChange={(_e, v) => {
						if (v !== null) {
							setLongDepositAmount(v);
						}
					}}
				>
					{[100_000, 500_000, 1_000_000].map((v, i) => (
						<ToggleButton key={i} disableRipple value={v} size="medium" className={styles.button}>
							{v.toLocaleString()}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6" color="textPrimary">
					Expiration
				</Typography>
				<ToggleButtonGroup
					value={expiry}
					exclusive
					onChange={(_e, v) => {
						if (v !== null) {
							setExpiry(v);
						}
					}}
				>
					{[10, 30, 60].map((v, i) => (
						<ToggleButton key={i} disableRipple value={v} size="medium" className={styles.button}>
							{v} min
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6" color="textPrimary">
					Leverage
				</Typography>
				<Slider defaultValue={2} step={1} min={1} max={10} marks valueLabelDisplay="on" onChange={(_e, v) => setMultiplier(v as number)} />
				<Typography sx={{ fontWeight: 500, mt: 2 }} variant="h6" color="textPrimary">
					Direction
				</Typography>
				<ToggleButtonGroup
					sx={{ mt: 2, mb: 2 }}
					value={isCall}
					exclusive
					onChange={(_e, v) => {
						if (v !== null) {
							setIsCall(v);
						}
					}}
				>
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setIsCall(true);
							setShowPreview(true);
							setShowConfirmTrade(true);
						}}
						className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
						disabled={!wallet.connected}
						sx={{ width: '50%', fontWeight: 700 }}
					>
						Buy/Long
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setIsCall(false);
							setShowPreview(true);
							setShowConfirmTrade(true);
						}}
						className={cn(styles.button, !wallet.connected ? '' : styles.sell)}
						disabled={!wallet.connected}
						sx={{ width: '50%', fontWeight: 700 }}
					>
						Sell/Short
					</Button>
				</ToggleButtonGroup>
				{showPreview && wallet.connected ? (
					<Box className={styles.preview}>
						<Typography sx={{ fontWeight: 500, mt: 2 }} color="textPrimary">
							<span> </span>
							Strike: {isCall ? 'Above' : 'Below'}{' '}
							<LoadingValue isLoading={!isInitialized}>
								<span>${isInitialized && formatWithDecimalDigits(strike, 4)}</span>
							</LoadingValue>{' '}
							<br />
							Expiy: in {expiry} minutes <br />
							Max Profit: {shortDepositAmount.toLocaleString()} BONK
							<br />
							Max Loss: {longDepositAmount.toLocaleString()} BONK
						</Typography>
					</Box>
				) : (
					'No'
				)}
				{showConfirmTrade ? (
					<Button variant="contained" sx={{ mt: 2 }} onClick={onCreateContractButtonClick} size="large">
						Confirm trade
					</Button>
				) : (
					''
				)}
			</Box>
		</ThemeProvider>
	);
};

export default ProPage;

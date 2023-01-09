import { useContext, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Collapse, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import LoadingValue from 'components/LoadingValue';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
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

import styles from './BonkFixedPayout.module.scss';

const BonkFixedPayout = () => {
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
	const [expiry, setExpiry] = useState(30);

	const shortDepositAmount = longDepositAmount * multiplier;
	const [strike, setStrike] = useState(0);

	const [open, setOpen] = useState(true);

	useEffect(() => {
		if (isInitialized) {
			setStrike(BSDigitalStrike(pricesValue[0], 0, 1, expiry / 60 / 24 / 365, isCall, 1 / multiplier));
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
		<Box sx={{ display: 'flex', width: '100%', mt: 1, justifyContent: 'center', height: '93vh' }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 16 }} className={styles.container}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
					<Typography sx={{ fontWeight: 500, justifyContent: 'center', paddingBottom: '0px', paddingTop: '0px' }} variant="h4">
						🐕 BONK OPTIONS 🐕
					</Typography>
					<Typography sx={{ fontWeight: 500, justifyContent: 'center', paddingBottom: '10px', paddingTop: '0px' }} variant="h6">
						🐍 by VYPER OTC 🐍
					</Typography>
					<Box className={styles.glow} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 6 }}>
						<Typography sx={{ fontWeight: 500 }} variant="h6">
							I think BONK is going {isCall ? '⬆️' : '⬇️'}
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
							{[100_000, 500_000, 1_000_000].map((v, i) => (
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
							{[10, 30, 60].map((v, i) => (
								<ToggleButton className={cn(styles.button, styles.fourth)} key={i} disableRipple value={v} size="small" sx={{ mx: 1.5 }}>
									{v} min
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</Box>

					<Box>
						<Typography sx={{ mt: 1, fontWeight: 400, textTransform: 'uppercase' }} variant="h6" align="center">
							win if BONK is {isCall ? 'above' : 'below'}{' '}
							<LoadingValue isLoading={!isInitialized}>
								<span className={styles.highlight}>${isInitialized && formatWithDecimalDigits(strike, 4)}</span>
							</LoadingValue>{' '}
							in {expiry} minutes
							<br />
							<b>{isCall ? 'above' : 'below'}</b> 👉🏻 <span className={styles.profit}> +{shortDepositAmount.toLocaleString()} BONK</span> 🤑
							<br />
							<b>{isCall ? 'below' : 'above'}</b> 👉🏻 <span className={styles.loss}> -{longDepositAmount.toLocaleString()} BONK</span> 💸
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
							You will pay {longDepositAmount.toLocaleString()} BONK 🐕 from your wallet to enter the trade.
						</Alert>
					</Collapse>
				</Box>
			</Box>

			<Box sx={{ width: '100%', height: '100%' }} className={styles.desktop_only}>
				<iframe src="https://birdeye.so/tv-widget/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" width={'100%'} height={'100%'} />
				<Box sx={{ display: 'flex' }}>
					<a href="https://birdeye.so/" target="_blank" rel="noopener noreferrer">
						<Box sx={{ display: 'inline-flex', flexDirection: 'row', justifyItems: 'center', height: '32px' }}>
							<Typography sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>Powered by</Typography>
							<Box
								sx={{ backgroundColor: 'grey', borderRadius: 8, p: 0.5 }}
								component="img"
								src="https://birdeye.so/static/media/logo-birdeye.f6511fe2e85b2503f8f4.png"
								width={'80px'}
							/>
						</Box>
					</a>
				</Box>
			</Box>
		</Box>
	);
};

export default BonkFixedPayout;

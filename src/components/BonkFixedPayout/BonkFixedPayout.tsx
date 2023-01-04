import { useContext, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import cn from 'classnames';
import LoadingValue from 'components/LoadingValue';
import MessageAlert from 'components/MessageAlert';
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
	const longDepositAmount = 1_000_000;

	const strike = isInitialized ? pricesValue[0] * (isCall ? 1.02 : 0.98) : 0;

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
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }} className={styles.container}>
			<Box component={'img'} src={'/bonk-logo.png'} sx={{ maxWidth: '250px' }} />

			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
				<Typography sx={{ fontWeight: 600 }} variant="h5">
					I think BONK will go
				</Typography>
				<ToggleButtonGroup sx={{ mt: 2 }} value={isCall} exclusive onChange={(_e, v) => setIsCall(v)}>
					{['UP', 'DOWN'].map((v, i) => (
						<ToggleButton sx={{ width: '96px' }} key={i} disableRipple value={v === 'UP'} size="medium">
							{v}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<Box>
					<Typography sx={{ mt: 4, fontWeight: 600, textTransform: 'uppercase' }} variant="h6" align="center">
						bet 1,000,000 BONK and <br />
						win if BONK is {isCall ? 'above' : 'below'}{' '}
						<LoadingValue isLoading={!isInitialized}>
							<span className={styles.highlight}>${isInitialized && formatSmallNumber(strike)}</span>
						</LoadingValue>{' '}
						in 30 minutes
						<br />
						<br />
						If BONK/USD is <b>{isCall ? 'above' : 'below'}</b> you <span className={styles.profit}>win 2,000,000 BONK</span> 🤑
						<br />
						If BONK/USD is <b>{isCall ? 'below' : 'above'}</b> you <span className={styles.loss}>lose 1,000,000 BONK</span>
					</Typography>
				</Box>
				<LoadingButton
					sx={{ mt: 2 }}
					className={cn(styles.button, !wallet.connected ? '' : styles.buy)}
					loading={isLoading}
					variant="contained"
					disabled={!wallet.connected}
					onClick={onCreateContractButtonClick}
					size="large"
				>
					{wallet.connected ? 'Double or nothing' : 'Connect wallet'}
				</LoadingButton>
				<Box className={styles.alert}>
					<MessageAlert message="You will send 1,000,000 BONK from your wallet to enter the bet" severity="warning" />
				</Box>
			</Box>
		</Box>
	);
};

export default BonkFixedPayout;

/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { Box, Button, CircularProgress, ToggleButton, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import MomentTooltipSpan from 'components/MomentTooltipSpan';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import TradingViewChart from 'components/TradingViewChart';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import moment from 'moment';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

import cn from 'classnames';

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
	const settleStart = moment().add(1, 'hour').toDate().getTime();

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const initParams: OtcInitializationParams = {
				depositEnd: moment().add(5, 'minutes').toDate().getTime(),
				settleStart,

				longDepositAmount,
				shortDepositAmount: longDepositAmount * 10,
				aliasId: 'digital',
				payoffOption: {
					payoffId: 'digital',
					strike: 0.5,
					isCall: true
				},
				...DEFAULT_INIT_PARAMS
			};

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams);

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
		<Box className={cn(styles.container, styles.actionGroup)}>
			<h6>Select how much you want to bet</h6>
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
			<Typography className={styles.description} sx={{ my: 1 }}>
				<b>Max gain</b>: <span className={styles.profit}>${longDepositAmount * 10}</span> if SOL/USD is <span className={styles.highlight}>above $15.65</span>{' '}
				<MomentTooltipSpan datetime={settleStart} />
			</Typography>
			<Typography className={styles.description} sx={{ my: 1 }}>
				<b>Max loss</b>: <span className={styles.loss}>${longDepositAmount}</span> if SOL/USD is <span className={styles.highlight}>below $15.65</span>{' '}
				<MomentTooltipSpan datetime={settleStart} />
			</Typography>
			{isLoading ? (
				<CircularProgress />
			) : (
				<Button variant="contained" disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					{wallet.connected ? '10x 🚀' : 'Connect wallet'}
				</Button>
			)}
		</Box>
	);
};

const CreateSol10xPage = () => {
	return (
		<Layout pageTitle={'SOL 10x'}>
			<Box className={styles.container}>
				<h1>SOL 10x in one click</h1>
				<Box sx={{ display: 'flex' }}>
					<Box sx={{ width: '65vw' }}>
						<TradingViewChart symbol="SOLUSD" />
					</Box>
					<ActionPanel />
				</Box>
			</Box>
		</Layout>
	);
};

export default CreateSol10xPage;

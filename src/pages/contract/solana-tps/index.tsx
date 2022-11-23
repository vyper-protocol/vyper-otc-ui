/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { Alert, AlertTitle, Box, Button, CircularProgress, FormControlLabel, FormGroup, TextField, Stack, Switch, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import moment from 'moment';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

const CreateSbfJailContractPage = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const [saveOnDatabase, setSaveOnDatabase] = useState(true);
	const [sendNotification, setSendNotification] = useState(true);

	const [longAmount, setLongAmount] = useState(3000);
	const onChange = (event) => {
		console.log('onChange called');
		setLongAmount(event.target.value);
	};

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const redeemLogicOption: OtcInitializationParams['redeemLogicOption'] = {
				redeemLogicPluginType: 'forward',
				strike: longAmount,
				notional: 1,
				isLinear: true
			};

			const depositStart = moment().toDate().getTime();
			const depositEnd = moment().add(2, 'days').toDate().getTime();
			const settleStart = moment('2022-12-31 09:00:00Z').toDate().getTime();

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W'),
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount: 1000,
				juniorDepositAmount: 1000,
				rateOption: {
					ratePluginType: 'switchboard',
					rateAccounts: [new PublicKey('HiYdnuhYMBj9wUUn1G9KkTRQug3CXgBSsQHb3JD4UmYw')]
				},
				redeemLogicOption,
				saveOnDatabase,
				sendNotification
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
		<Layout>
			<Box>
				<Stack spacing={4} direction="column" justifyContent="center" alignItems="center">
					<Stack spacing={4} direction="column">
						<h1>SOLANA-TPS-2022 Contract</h1>
						<Box
							justifyContent="center"
							alignItems="center"
							component="img"
							sx={{
								// height: 233,
								// width: 350,
								// maxHeight: { xs: 233, md: 167 },
								maxWidth: { xs: 900, md: 400 },
								alignItems: 'center',
								justify: 'center'
							}}
							alt="toly"
							src="/toly.png"
						/>
					</Stack>
					<Alert sx={{ maxWidth: '800px', marginBottom: '10' }} severity="warning">
						<AlertTitle>How to trade this? </AlertTitle>
						<Typography>
							Choose a tx number from from 1000 to 4000 to select the amount of transaction Solana will be able to by 31-Dec-22, where 1000 is the{' '}
							<b>MINIMUM</b> and 4000 is <b>MAXIMUM</b>.<br />
							<br />
							Once the contract is created you also need to deposit the funds so remember to click on LONG to buy the contract, and SHORT if you want to sell
							it.
							<br />
							<br />
							Both sides have to deposit an amount of 100, this also corresponds to the maximum gain and loss of this contract. If you want to check the orders
							created by other users just head to the{' '}
							<u>
								<a target="_blank" rel="noreferrer" href={UrlBuilder.buildExplorerUrl()}>
									explorer
								</a>
							</u>
						</Typography>
					</Alert>

					<Stack spacing={10} direction="row" sx={{ mb: 1 }} alignItems="center">
						<Typography sx={{ mb: 1 }}>EXCEL SPREADSHEET (1000)</Typography>

						<TextField value={longAmount} defaultValue="150" name="strike" type="tel" onChange={onChange}></TextField>

						<Typography>BIG VALIDATORS VALIDATING (4000)</Typography>
					</Stack>

					{process.env.NODE_ENV === 'development' && (
						<FormGroup>
							<FormControlLabel
								control={<Switch defaultChecked checked={saveOnDatabase} onChange={(e) => setSaveOnDatabase(e.target.checked)} />}
								label="Save on database"
							/>
							<FormControlLabel
								control={<Switch defaultChecked checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />}
								label="Send notification"
							/>
						</FormGroup>
					)}

					<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
						{isLoading ? (
							<CircularProgress />
						) : (
							<Button variant="outlined" disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
								{wallet.connected ? 'Create Contract 🔥🚀' : 'Connect wallet'}
							</Button>
						)}

						<Typography>
							This will deploy the contract on <b>DEVNET</b> with fake USDC.
						</Typography>
					</Stack>
					<hr />
				</Stack>
			</Box>
		</Layout>
	);
};

export default CreateSbfJailContractPage;

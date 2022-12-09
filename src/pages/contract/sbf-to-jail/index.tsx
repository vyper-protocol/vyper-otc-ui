/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { Alert, AlertTitle, Box, Button, CircularProgress, FormControlLabel, FormGroup, Slider, Stack, Switch, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
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

	const [longAmount, setLongAmount] = useState(50);

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const payoffOption: OtcInitializationParams['payoffOption'] = {
				payoffId: 'digital',
				strike: 0.5,
				isCall: true
			};

			const depositStart = moment().toDate().getTime();
			const depositEnd = moment().add(2, 'days').toDate().getTime();
			const settleStart = moment('2022-12-31 09:00:00Z').toDate().getTime();

			const initParams: OtcInitializationParams = {
				collateralMint: '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W',
				depositStart,
				depositEnd,
				settleStart,
				longDepositAmount: longAmount,
				shortDepositAmount: 100,
				aliasId: 'digital',
				rateOption: {
					ratePluginType: 'switchboard',
					rateAccounts: ['3DVLHvQSfTiU5EjswsQHr4MTNxtyaUFaWSshakQnKJoW']
				},
				payoffOption,
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
		<Layout pageTitle={'SBF to JAIL 2022'}>
			<Box>
				<Stack spacing={2} direction="column" justifyContent="center" alignItems="center">
					<Stack spacing={2} direction="column">
						<h1>SBF-JAIL-2022 Contract</h1>
						<Box
							component="img"
							sx={{
								// height: 233,
								// width: 350,
								// maxHeight: { xs: 233, md: 167 },
								maxWidth: { xs: 650, md: 400 }
							}}
							alt="sbf-to-jail"
							src="/sbf-to-jail.jpg"
						/>
					</Stack>
					<Alert sx={{ maxWidth: '800px', marginBottom: '10' }} severity="warning">
						<AlertTitle>How to trade this? </AlertTitle>
						<Typography>
							Choose a value from 0 to 100 to select the probability of SBF being convicted by 31-Dec-22, where 0 is <b>NOT GONNA HAPPEN</b> and 100 is{' '}
							<b>DEFINITELY HAPPENING</b>.<br />
							<br />
							Once the contract is created you also need to deposit the funds so remember to click on LONG to buy the contract, and SHORT if you want to sell
							it.
							<br />
							<br />
							LONG side just needs to deposit an amount equal to the probability of SBF being convicted. SHORT side has to deposit 100. If you want to check the
							orders created by other users just head to the{' '}
							<u>
								<a target="_blank" rel="noreferrer" href={UrlBuilder.buildExplorerUrl()}>
									explorer
								</a>
							</u>
						</Typography>
					</Alert>

					<Stack spacing={10} direction="row" sx={{ mb: 1 }} alignItems="center">
						<Typography sx={{ mb: 1 }}>NOT GONNA HAPPEN (0)</Typography>

						<Slider
							value={longAmount}
							valueLabelDisplay="on"
							onChange={(_, newValue: number) => {
								if (newValue < 1) return setLongAmount(1);
								if (newValue > 100) return setLongAmount(100);
								return setLongAmount(newValue);
							}}
						/>

						<Typography>DEFINITELY HAPPENING (100)</Typography>
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

					<Alert sx={{ maxWidth: '800px' }} severity="info" variant="outlined">
						<AlertTitle>What is the SBF-JAIL-2022 contract?</AlertTitle>
						<Typography>
							<br /> SBF-JAIL-2022 is an event contract on Vyper Protocol. SBF-JAIL-2022 expires to 100 if Sam Bankman Fried is convicted for ANY CRIME by a
							Court in any country (United States of America, Bahamas, Hong Kong, etc), and 0 otherwise.
							<br />
							<br />
							The event contract expires on <b>31th DECEMBER 2022 - 9AM UTC</b>. You can think of this as a yes-or-no question, where there are only two
							outcomes possible. The price for the JAIL side will be higher if more people believe there is a high chance of SBF being convicted, and lower if
							more believe in NO JAIL.
							<br />
							<br />
							The primary resolution source for this market shall be any news outlet and publication such as Bloomberg, WSJ plus others as well as any official
							information from government entities such as FBI, Justice Department and others.
						</Typography>
					</Alert>
				</Stack>
			</Box>
		</Layout>
	);
};

export default CreateSbfJailContractPage;

/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { Alert, AlertTitle, FormControlLabel, FormGroup, Slider, Stack, Switch, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { Button, Pane } from 'evergreen-ui';
import moment from 'moment';
import Image from 'next/image';
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

	const [longAmount, setLongAmount] = useState(20);

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const redeemLogicOption: OtcInitializationParams['redeemLogicOption'] = {
				redeemLogicPluginType: 'digital',
				strike: 0.5,
				isCall: true
			};

			const depositStart = moment().toDate().getTime();
			const depositEnd = moment().add(2, 'days').toDate().getTime();
			const settleStart = moment('2022-12-30 09:00:00Z').toDate().getTime();

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W'),
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount: longAmount,
				juniorDepositAmount: 100,
				rateOption: {
					ratePluginType: 'switchboard',
					rateAccounts: [new PublicKey('3DVLHvQSfTiU5EjswsQHr4MTNxtyaUFaWSshakQnKJoW')]
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
			<Pane maxWidth={600}>
				<Pane textAlign="center">
					<h1>SBF JAIL Contract</h1>
					<Image width="400" height="200" alt="abstract-colors" src="/sbf-to-jail.jpg" />
				</Pane>
				<Alert sx={{ maxWidth: '800px', marginBottom: '10' }} severity="warning">
					<AlertTitle>How to trade this? </AlertTitle>
					Each contract value can range from 0 to 100 so use the slider below to input the probability of SBF being indicted, where 0 is &apos;NOT GONNA
					HAPPEN&apos; and 100 is &apos;DEFINITELY HAPPENING&apos;. Once the contract is created you also need to deposit the funds so remember to click on LONG
					to buy the contract, and SHORT if you want to sell it. SHORT side has to deposit the full collateral amount, whereas the LONG side just need to
					deposit an amount equal to the probability of the event. If you want to check the orders created by other users just head to the Explorer{' '}
					<a target="_blank" rel="noreferrer" href={UrlBuilder.buildExplorerUrl()}>
						here
					</a>
				</Alert>

				<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
					<Typography>NOT GONNA HAPPEN (0)</Typography>

					<Slider
						aria-label="Volume"
						sx={{ paddingLeft: '10', paddingRight: '10' }}
						value={longAmount}
						onChange={(e: Event, newValue: number) => {
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
					<Button isLoading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
						Create Contract 🔥🚀
					</Button>
					<Typography>This will deploy the contract on devnet with fake USDC</Typography>
				</Stack>
				<hr />

				<Alert sx={{ maxWidth: '800px' }} severity="info" variant="outlined">
					<AlertTitle>SBF/FREE - SBF/JAIL ?</AlertTitle>
					What is the SBF-JAIL-2022 contract? SBF-JAIL-2022 is An event contract on Vyper Protocol. SBF-JAIL-2022 expires to $1 if Sam Bankman Fried is indicted
					for ANY CRIME by a Court in any country (United States of America, Bahamas, Hong Kong, etc), and $0 otherwise.
					<br />
					The event contract expires on 30th DECEMBER 9AM UTC TIME. You can think of this as a yes-or-no question, where there are only two outcomes possible.
					The price of the contract fluctuates and reflects the difference in demand for Yes or No. For example, the price for the Yes side will be higher if
					more people believe there is a high chance of SBF being convicted, and lower if more believe in No. In this way, event contracts aggregate opinions
					and can offer an objective measure of the likelihood of any event.
					<br />
					The primary resolution source for this market shall be any news outlet and publication such as Bloomberg, WSJ plus others as well as any official
					information from government entities such as FBI, Justice Department and others. A consensus of the above reporting may be also used.
					<br />
					We retain the final right to interpretation of this contract. We will not entertain any objections to this contract’s settlement mechanisms. By
					trading these contracts, you are agreeing to abide by interpretations of terms above.
				</Alert>
			</Pane>

			<Pane></Pane>
		</Layout>
	);
};

export default CreateSbfJailContractPage;

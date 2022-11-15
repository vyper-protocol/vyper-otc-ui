/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { FormControlLabel, FormGroup, Grid, Switch } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { Button, Pane, TextInputField } from 'evergreen-ui';
import moment from 'moment';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';

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
			}

			setIsLoading(true);

			const redeemLogicOption: OtcInitializationParams['redeemLogicOption'] = {
				redeemLogicPluginType: 'digital',
				strike: 0.5,
				isCall: true
			};

			const depositStart = moment().toDate().getTime();
			const depositEnd = moment().add(2, 'days').toDate().getTime();
			const settleStart = moment('2023-01-01 00:00:00').toDate().getTime();

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
			<Grid container direction="row">
				<Grid item>
					<Grid container direction="column">
						<Grid item>1</Grid>
						<Grid item>2</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Grid container direction="column">
						<Grid item>3</Grid>
						<Grid item>4</Grid>
					</Grid>
				</Grid>
			</Grid>

			<Pane>
				<TextInputField
					label="Long amount"
					type="number"
					value={longAmount}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const val = Number(e.target.value);
						if (val < 1) return setLongAmount(1);
						if (val > 100) return setLongAmount(100);
						return setLongAmount(val);
					}}
				/>

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
				<Button isLoading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					Create Contract
				</Button>
			</Pane>
		</Layout>
	);
};

export default CreateSbfJailContractPage;

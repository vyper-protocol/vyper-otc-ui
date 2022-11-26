/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import NonAuditedDisclaimer from 'components/molecules/NonAuditedDisclaimer';
import CreateContractFlow from 'components/organisms/CreateContractFlow';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { OracleDetail } from 'models/OracleDetail';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import moment from 'moment';
import { useRouter } from 'next/router';
import useContractStore from 'store/useContractStore';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import { getRateExplorer } from 'utils/oraclesExplorerHelper';
import * as UrlBuilder from 'utils/urlBuilder';

const CreateContractPage = () => {
	const { contractData } = useContractStore();
	console.log('contractData: ', contractData);

	const contractStore = useContractStore();
	const isPresentTempData = contractStore?.contractData != null;
	useEffect(() => {
		contractStore.delete();
	}, []);

	const currentCluster = getCurrentCluster();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [initParams, setInitParams] = useState<OtcInitializationParams>(
		contractStore?.contractData ?? {
			depositStart: moment().add(-60, 'minutes').toDate().getTime(),
			depositEnd: moment().add(5, 'minutes').toDate().getTime(),
			settleStart: moment().add(15, 'minutes').toDate().getTime(),

			juniorDepositAmount: 100,
			seniorDepositAmount: 100,

			redeemLogicOption: {
				redeemLogicPluginType: 'forward',
				notional: 1,
				strike: 0,
				isCall: true
			},

			rateOption: {
				ratePluginType: 'pyth',
				rateAccounts: [
					new PublicKey(currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
					new PublicKey(currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG')
				]
			},

			// USDC in mainnet, devUSD in devnet
			reserveMint: new PublicKey(currentCluster === 'devnet' ? '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
			saveOnDatabase: process.env.NODE_ENV !== 'development',
			sendNotification: process.env.NODE_ENV !== 'development'
		}
	);

	const [isLoading, setIsLoading] = useState(false);

	const setStrikeToDefaultValue = async () => {
		let price = 0;
		try {
			if (initParams.rateOption.ratePluginType === 'pyth') {
				const [, priceData] = await RatePythState.GetProductPrice(connection, currentCluster, new PublicKey(initParams.rateOption.rateAccounts[0]));
				price = priceData?.price ?? 0;
			}
			if (initParams.rateOption.ratePluginType === 'switchboard') {
				// TODO fix fetching issue
				const priceData = await RateSwitchboardState.GetLatestPrice(connection, new PublicKey(initParams.rateOption.rateAccounts[0]));
				price = priceData ?? 0;
			}
		} catch (e) {
			// setStrike(0);
			console.error('err: ', e);
		}

		setInitParams({
			...initParams,
			redeemLogicOption: {
				...initParams.redeemLogicOption,
				strike: price
			}
		});
	};

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

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
			<NonAuditedDisclaimer />
			<Box sx={{ width: '75vh', alignItems: 'center', my: 2 }}>
				<CreateContractFlow
					initialStep={isPresentTempData ? 4 : 0}
					contractInitParams={initParams}
					onContractInitParamsChange={setInitParams}
					isLoading={isLoading}
					onCreateContractButtonClick={onCreateContractButtonClick}
				/>
			</Box>
		</Layout>
	);
};

export default CreateContractPage;

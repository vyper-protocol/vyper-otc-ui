/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import CreateContractFlow from 'components/CreateContractFlow';
import NonAuditedDisclaimer from 'components/NonAuditedDisclaimer';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import { DEFAULT_INIT_PARAMS } from 'configs/defaults';
import createContract from 'controllers/createContract';
import { getPriceForStrike } from 'controllers/createContract/OtcInitializationParams';
import { useRouter } from 'next/router';
import useContractStore from 'store/useContractStore';
import * as UrlBuilder from 'utils/urlBuilder';

// import dynamic from 'next/dynamic';
// const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const CreateContractPage = () => {
	const contractStore = useContractStore();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [initParams, setInitParams] = useState(DEFAULT_INIT_PARAMS);

	// eslint-disable-next-line eqeqeq
	const isPresentTempData = contractStore?.contractData != null;
	useEffect(() => {
		if (contractStore?.contractData) {
			setInitParams(contractStore?.contractData);
			contractStore.delete();
		} else {
			getPriceForStrike(initParams.rateOption.ratePluginType, initParams.rateOption.rateAccounts, connection, getCurrentCluster()).then((newStrike) => {
				setInitParams({ ...initParams, payoffOption: { ...initParams.payoffOption, strike: newStrike } });
			});
		}
	}, []);

	const [isLoading, setIsLoading] = useState(false);

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
		<Layout pageTitle={'Create a new contract'}>
			<NonAuditedDisclaimer />
			<Box sx={{ width: '75vh', alignItems: 'center', my: 2 }}>
				{/* <DynamicReactJson src={initParams} /> */}
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

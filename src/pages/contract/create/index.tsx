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
	useEffect(() => {
		contractStore.delete();
	}, []);

	const currentCluster = getCurrentCluster();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);
	const [saveOnDatabase, setSaveOnDatabase] = useState(
		process.env.NODE_ENV === 'development' ? false : contractData?.saveOnDatabase !== undefined ? contractData.saveOnDatabase : true
	);
	const [sendNotification, setSendNotification] = useState(
		process.env.NODE_ENV === 'development' ? false : contractData?.sendNotification !== undefined ? contractData.sendNotification : true
	);

	// USDC in mainnet, devUSD in devnet
	const defaultMint = currentCluster === 'devnet' ? '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
	const [reserveMint, setReserveMint] = useState(getMintByPubkey(defaultMint));

	// assume deposit always starts open
	// eslint-disable-next-line no-unused-vars
	const [depositStart, setDepositStart] = useState(contractData?.depositStart ? contractData.depositStart : moment().add(-60, 'minutes').toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(contractData?.depositEnd ? contractData.depositEnd : moment().add(5, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(contractData?.settleStart ? contractData.settleStart : moment().add(15, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(contractData?.seniorDepositAmount ? contractData.seniorDepositAmount : 100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(contractData?.juniorDepositAmount ? contractData.juniorDepositAmount : 100);

	const [redeemLogicPluginType, setRedeemLogicPluginType] = useState<RLPluginTypeIds>(
		contractData?.redeemLogicOption?.redeemLogicPluginType ? contractData.redeemLogicOption.redeemLogicPluginType : 'forward'
	);

	// pyth SOL/USD
	const tempDefaultOracle = currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG';
	const defaultOracle1 = contractData?.rateOption?.rateAccounts.length > 0 ? contractData.rateOption.rateAccounts[0].toBase58() : tempDefaultOracle;
	const defaultOracle2 = contractData?.rateOption?.rateAccounts.length > 1 ? contractData.rateOption.rateAccounts[1].toBase58() : tempDefaultOracle;

	const [ratePlugin1, setRatePlugin1] = useState(
		getOracleByPubkey(defaultOracle1) ??
			({
				type: contractData.rateOption.ratePluginType,
				pubkey: defaultOracle1,
				title: 'NA',
				explorerUrl: getRateExplorer(contractData.rateOption.ratePluginType),
				quoteCurrency: '',
				baseCurrency: ''
			} as OracleDetail)
	);
	console.log('ratePlugin1: ', ratePlugin1);
	const [ratePlugin2, setRatePlugin2] = useState(
		getOracleByPubkey(defaultOracle2) ??
			({
				type: contractData.rateOption.ratePluginType,
				pubkey: defaultOracle2,
				title: 'NA',
				explorerUrl: getRateExplorer(contractData.rateOption.ratePluginType),
				quoteCurrency: '',
				baseCurrency: ''
			} as OracleDetail)
	);

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);
	const [isCall, setIsCall] = useState(true);

	const setStrikeToDefaultValue = async () => {
		let price = 0;
		try {
			if (ratePlugin1.type === 'pyth') {
				const [, priceData] = await RatePythState.GetProductPrice(connection, currentCluster, new PublicKey(ratePlugin1.pubkey));
				price = priceData?.price ?? 0;
			}
			if (ratePlugin1.type === 'switchboard') {
				// TODO fix fetching issue
				const priceData = await RateSwitchboardState.GetLatestPrice(connection, new PublicKey(ratePlugin1.pubkey));
				price = priceData ?? 0;
			}
		} catch (e) {
			// setStrike(0);
			console.error('err: ', e);
		}
		setStrike(formatWithDecimalDigits(price));
	};

	useEffect(() => {
		if (!contractData?.redeemLogicOption?.strike) {
			setStrikeToDefaultValue();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ratePlugin1.type, ratePlugin1.pubkey]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const rateAccounts: PublicKey[] = [];
			rateAccounts.push(new PublicKey(ratePlugin1.pubkey));
			if (redeemLogicPluginType === 'settled_forward') {
				rateAccounts.push(new PublicKey(ratePlugin2.pubkey));
			}

			let redeemLogicOption: OtcInitializationParams['redeemLogicOption'];

			if (redeemLogicPluginType === 'forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike
				};
			} else if (redeemLogicPluginType === 'settled_forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike,
					isStandard: false
				};
			} else if (redeemLogicPluginType === 'digital') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					isCall
				};
			} else if (redeemLogicPluginType === 'vanilla_option') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					notional,
					isCall,
					isLinear: true
				};
			} else {
				throw Error('redeem logic plugin not supported: ' + redeemLogicPluginType);
			}

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey(reserveMint.pubkey),
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount,
				juniorDepositAmount,
				rateOption: {
					ratePluginType: ratePlugin1.type,
					rateAccounts
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
			<NonAuditedDisclaimer />
			<Box sx={{ width: '75vh', alignItems: 'center', my: 2 }}>
				<CreateContractFlow
					redeemLogicPluginType={redeemLogicPluginType}
					setRedeemLogicPluginType={setRedeemLogicPluginType}
					strike={strike}
					setStrike={setStrike}
					notional={notional}
					setNotional={setNotional}
					isCall={isCall}
					setIsCall={setIsCall}
					ratePlugin1={ratePlugin1}
					setRatePlugin1={setRatePlugin1}
					ratePlugin2={ratePlugin2}
					setRatePlugin2={setRatePlugin2}
					seniorDepositAmount={seniorDepositAmount}
					setSeniorDepositAmount={setSeniorDepositAmount}
					juniorDepositAmount={juniorDepositAmount}
					setJuniorDepositAmount={setJuniorDepositAmount}
					reserveMint={reserveMint}
					setReserveMint={setReserveMint}
					depositEnd={depositEnd}
					setDepositEnd={setDepositEnd}
					settleStart={settleStart}
					setSettleStart={setSettleStart}
					saveOnDatabase={saveOnDatabase}
					setSaveOnDatabase={setSaveOnDatabase}
					sendNotification={sendNotification}
					setSendNotification={setSendNotification}
					isLoading={isLoading}
					onCreateContractButtonClick={onCreateContractButtonClick}
				/>
			</Box>
		</Layout>
	);
};

export default CreateContractPage;

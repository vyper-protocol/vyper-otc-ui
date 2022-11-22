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
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

const CreateContractPage = () => {
	const currentCluster = getCurrentCluster();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);
	const [saveOnDatabase, setSaveOnDatabase] = useState(process.env.NODE_ENV === 'development' ? false : true);
	const [sendNotification, setSendNotification] = useState(process.env.NODE_ENV === 'development' ? false : true);

	const [reserveMint, setReserveMint] = useState('');

	// assume deposit always starts open
	// eslint-disable-next-line no-unused-vars
	const [depositStart, setDepositStart] = useState(moment().add(-60, 'minutes').toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(moment().add(5, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(moment().add(15, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(100);

	const [redeemLogicPluginType, setRedeemLogicPluginType] = useState<RLPluginTypeIds>('forward');

	// pyth SOL/USD
	const defaultOracle = currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG';

	const [ratePlugin1, setRatePlugin1] = useState<OracleDetail>(getOracleByPubkey(defaultOracle));
	const [ratePlugin2, setRatePlugin2] = useState<OracleDetail>(getOracleByPubkey(defaultOracle));

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);
	const [isCall, setIsCall] = useState(true);

	const setStrikeToDefaultValue = async () => {
		try {
			if (ratePlugin1.type === 'pyth') {
				const [, price] = await RatePythState.GetProductPrice(connection, currentCluster, new PublicKey(ratePlugin1.pubkey));
				setStrike(price?.price ?? 0);
			}
			if (ratePlugin1.type === 'switchboard') {
				// TODO fix fetching issue
				const [, price] = await RateSwitchboardState.LoadAggregatorData(connection, new PublicKey(ratePlugin1.pubkey));
				setStrike(price ?? 0);
			}
		} catch {
			setStrike(0);
		}
	};

	useEffect(() => {
		setStrikeToDefaultValue();
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
				reserveMint: new PublicKey(reserveMint),
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

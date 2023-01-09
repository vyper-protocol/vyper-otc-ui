import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import moment from 'moment';

export const createDefaultInitParams = (): OtcInitializationParams => ({
	depositStart: moment().add(-60, 'minutes').toDate().getTime(),
	depositEnd: moment().add(5, 'minutes').toDate().getTime(),
	settleStart: moment().add(15, 'minutes').toDate().getTime(),

	shortDepositAmount: 100,
	longDepositAmount: 100,

	aliasId: 'forward',

	payoffOption: {
		payoffId: 'forward',
		notional: 1,
		strike: 0,
		isCall: true,
		isLinear: true,
		isStandard: false
	},

	rateOption: {
		ratePluginType: 'pyth',

		// SOL/USD
		rateAccounts: [getCurrentCluster() === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG']
	},

	referralCode: undefined,

	// USDC in mainnet, devUSD in devnet
	collateralMint: getCurrentCluster() === 'devnet' ? '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	saveOnDatabase: process.env.NODE_ENV !== 'development',
	sendNotification: process.env.NODE_ENV !== 'development'
});

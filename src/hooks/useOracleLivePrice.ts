/* eslint-disable no-console */
import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Mutex } from 'async-mutex';
import _ from 'lodash';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';
import { RatePythPlugin } from 'models/plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from 'models/plugins/rate/RateSwitchboardPlugin';
import { getMultipleAccountsInfo } from 'utils/multipleAccountHelper';

export const useOracleLivePrice = (oracleType: RatePluginTypeIds, pubkeys: string[]): { pricesValue: number[]; isInitialized: boolean } => {
	const [pricesValue, setPricesValue] = useState<number[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const { connection } = useConnection();

	const mutex = new Mutex();

	const accountsToWatch = pubkeys.map((c) => new PublicKey(c));

	const decodeAccountInfo = async (updatedAccountInfo: AccountInfo<Buffer>): Promise<number> => {
		let newPriceValue = 0;
		if (oracleType === 'switchboard') {
			newPriceValue = await RateSwitchboardPlugin.DecodePriceFromAccountInfo(connection, updatedAccountInfo);
		}
		if (oracleType === 'pyth') {
			newPriceValue = RatePythPlugin.DecodePriceFromAccountInfo(updatedAccountInfo);
		}
		return newPriceValue;
	};

	// first fetch
	useEffect(() => {
		const fetchData = async () => {
			const accountsData = await getMultipleAccountsInfo(connection, accountsToWatch);
			const newPricesValue = await Promise.all(accountsData.map((c) => decodeAccountInfo(c.data)));
			// console.log('set new prices value: ', newPricesValue);
			setPricesValue(newPricesValue);
			setIsInitialized(true);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// listen for account changes
	useEffect(() => {
		const subscriptionsId = accountsToWatch.map((pubkey, i) =>
			connection.onAccountChange(
				pubkey,
				async (updatedAccountInfo) => {
					const newPriceValue = await decodeAccountInfo(updatedAccountInfo);

					// if price changed we update it
					if (newPriceValue !== pricesValue[i] && isInitialized) {
						await mutex.runExclusive(async () => {
							const pricesValueClone = _.clone(pricesValue);
							pricesValueClone[i] = newPriceValue;

							// console.log(`${oracleType} price changed for ${abbreviateAddress(pubkey.toBase58())} from ${pricesValue[i]} to ${newPriceValue}`);
							setPricesValue(pricesValueClone);
						});
					}
				},
				'confirmed'
			)
		);

		return () => {
			subscriptionsId.map((c) => connection.removeAccountChangeListener(c));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { pricesValue, isInitialized };
};

/* eslint-disable no-console */
import { useCallback, useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Mutex } from 'async-mutex';
import _ from 'lodash';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { getMultipleAccountsInfo } from 'utils/multipleAccountHelper';

export const useOracleLivePrice = (
	oracleType: RatePluginTypeIds,
	pubkeys: string[]
): { pricesValue: number[]; isInitialized: boolean; removeListener: () => void } => {
	const [pricesValue, setPricesValue] = useState<number[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [accountsToWatch] = useState<PublicKey[]>(pubkeys.map((c) => new PublicKey(c)));
	const [subscriptionsId, setSubscriptionsId] = useState<number[]>([]);

	const { connection } = useConnection();

	const removeListener = useCallback(() => {
		// console.log('Remove Listener Called');
		subscriptionsId.map((c) => connection.removeAccountChangeListener(c));
	}, [connection, subscriptionsId]);

	const decodeAccountInfo = useCallback(
		async (updatedAccountInfo: AccountInfo<Buffer>): Promise<number> => {
			let newPriceValue = 0;
			if (oracleType === 'switchboard') {
				newPriceValue = await RateSwitchboardState.DecodePriceFromAccountInfo(connection, updatedAccountInfo);
			}
			if (oracleType === 'pyth') {
				newPriceValue = RatePythState.DecodePriceFromAccountInfo(updatedAccountInfo);
			}
			return newPriceValue;
		},
		[connection, oracleType]
	);

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
	}, [accountsToWatch, connection, decodeAccountInfo]);

	// listen for account changes
	useEffect(() => {
		const mutex = new Mutex();
		const subscriptionIds = accountsToWatch.map((pubkey, i) =>
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
		setSubscriptionsId(subscriptionIds);

		return () => {
			subscriptionIds.map((c) => connection.removeAccountChangeListener(c));
		};
	}, [accountsToWatch, connection, decodeAccountInfo, isInitialized, oracleType, pricesValue]);

	return { pricesValue, isInitialized, removeListener };
};

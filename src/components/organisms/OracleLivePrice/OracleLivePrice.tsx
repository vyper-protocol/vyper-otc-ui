/* eslint-disable no-console */
import { useEffect, useState } from 'react';

import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import RateSwitchboardState from 'models/plugins/rate/RateSwitchboardState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { abbreviateAddress } from 'utils/stringHelpers';

type OracleLivePriceInput = {
	oracleType: RatePluginTypeIds;
	pubkey: string;
};

const OracleLivePrice = ({ oracleType, pubkey }: OracleLivePriceInput) => {
	const [priceValue, setPriceValue] = useState(0);
	const { connection } = useConnection();

	useEffect(() => {
		const accountToWatch = new PublicKey(pubkey);
		const subscriptionId = connection.onAccountChange(
			accountToWatch,
			async (updatedAccountInfo) => {
				// console.log(updatedAccountInfo.data);
				let newPriceValue = 0;
				if (oracleType === 'switchboard') {
					newPriceValue = await RateSwitchboardState.DecodePriceFromAccountInfo(connection, updatedAccountInfo);
				}
				if (oracleType === 'pyth') {
					newPriceValue = RatePythState.DecodePriceFromAccountInfo(updatedAccountInfo);
				}

				// if price changed we update it
				if (newPriceValue !== priceValue) {
					console.log(`${oracleType} price changed for ${abbreviateAddress(pubkey)} from ${priceValue} to ${newPriceValue}`);
					setPriceValue(newPriceValue);
				}
			},
			'confirmed'
		);

		return () => {
			connection.removeAccountChangeListener(subscriptionId);
		};
	});

	return <p>{formatWithDecimalDigits(priceValue, 5)}</p>;
};

export default OracleLivePrice;

/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { settleContract } from 'controllers/settleContract';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';

const SettleButton = ({ otcStatePubkey }: { otcStatePubkey: string }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	console.log(rateStateQuery);
	const [isLoading, setIsLoading] = useState(false);

	const onSettleClick = async () => {
		try {
			setIsLoading(true);
			await settleContract(provider, txHandler, new PublicKey(otcStatePubkey));
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			rateStateQuery.refetch();
		}
	};

	if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isSettlementAvailable()) {
		return <></>;
	}

	return <ButtonPill mode="info" text="Settle" onClick={onSettleClick} loading={isLoading} />;
};

export default SettleButton;

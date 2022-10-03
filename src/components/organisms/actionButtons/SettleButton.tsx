/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { settle } from 'api/otc-state/settle';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { PlusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';

export const SettleButton = ({ otcStatePubkey }: { otcStatePubkey: string }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);

	const onSettleClick = async () => {
		try {
			setIsLoading(true);
			const tx = await settle(provider, new PublicKey(otcStatePubkey));
			await txHandler.handleTxs(tx);
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

	return <ButtonPill mode="info" text="Settle" onClick={onSettleClick} icon={<PlusIcon />} loading={isLoading} />;
};

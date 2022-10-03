/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { withdraw } from 'api/otc-state/withdraw';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { MinusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';
import { useCluster } from 'hooks/useCluster';

const WithdrawButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const router = useRouter();
	const { cluster } = useCluster();

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey, cluster);
	const [isLoading, setIsLoading] = useState(false);

	const onWithdrawClick = async () => {
		try {
			setIsLoading(true);
			const tx = await withdraw(provider, new PublicKey(otcStatePubkey));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			rateStateQuery.refetch();
		}
	};

	if (isBuyer) {
		if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isWithdrawSeniorAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isWithdrawJuniorAvailable(wallet.publicKey)) {
		return <></>;
	}

	return <ButtonPill mode="info" text="Withdraw" onClick={onWithdrawClick} loading={isLoading} />;
};

export default WithdrawButton;

import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { withdraw } from 'api/otc-state/withdraw';
import ButtonPill from 'components/atoms/ButtonPill/ButtonPill';
import { MinusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { TxHandlerContext } from 'providers/TxHandlerProvider';

export const WithdrawButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
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

	return <ButtonPill mode="error" text="Withdraw" onClick={onWithdrawClick} icon={<MinusIcon />} loading={isLoading} />;
};

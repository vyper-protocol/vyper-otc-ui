import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import { withdraw } from 'api/otc-state/withdraw';
import ButtonPill from 'components/atoms/ButtonPill/ButtonPill';
import { MinusIcon, PlusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { OtcState } from 'models/OtcState';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { useContext, useState } from 'react';

export const WithdrawButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);

	const onWithdrawClick = async (e) => {
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
		if (rateStateQuery?.data == undefined || !rateStateQuery?.data?.isWithdrawSeniorAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else {
		if (rateStateQuery?.data == undefined || !rateStateQuery?.data?.isWithdrawJuniorAvailable(wallet.publicKey)) {
			return <></>;
		}
	}

	return <ButtonPill mode="error" text="Withdraw" onClick={onWithdrawClick} icon={<MinusIcon />} loading={isLoading} />;
};

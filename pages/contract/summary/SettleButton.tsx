import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import { settle } from 'api/otc-state/settle';
import ButtonPill from 'components/atoms/ButtonPill/ButtonPill';
import { PlusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { OtcState } from 'models/OtcState';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { useContext, useState } from 'react';

const SettleButton = ({ otcStatePubkey }: { otcStatePubkey: string }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);

	const onSettleClick = async (e) => {
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

	if (rateStateQuery?.data == undefined || !rateStateQuery?.data?.isSettlementAvailable()) {
		return <></>;
	}

	return <ButtonPill mode="info" text="Settle" onClick={onSettleClick} icon={<PlusIcon />} loading={isLoading} />;
};

export default SettleButton;

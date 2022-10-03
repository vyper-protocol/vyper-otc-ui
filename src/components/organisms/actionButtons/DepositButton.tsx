/* eslint-disable no-console */
import { useContext, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { PlusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';

const DepositButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);

	const onDepositClick = async () => {
		try {
			setIsLoading(true);
			const tx = await deposit(provider, new PublicKey(otcStatePubkey), isBuyer);
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			rateStateQuery.refetch();
		}
	};

	if (isBuyer) {
		if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositBuyerAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositSellerAvailable(wallet.publicKey)) {
		return <></>;
	}

	return (
		<ButtonPill
			mode="success"
			text={isBuyer ? 'Long' : 'Short'}
			onClick={onDepositClick}
			icon={<PlusIcon />}
			loading={isLoading}
		/>
	);
};

export default DepositButton;

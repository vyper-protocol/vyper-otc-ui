/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { unpackAccount } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claim } from 'api/otc-state/claim';
import ButtonPill from 'components/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';

const ClaimButton = ({ otcStatePubkey, isLong }: { otcStatePubkey: string; isLong: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeposited, setIsDeposited] = useState(false);

	useEffect(() => {
		const programTokenAccount = isLong ? rateStateQuery.data.chainData.programBuyerTA : rateStateQuery.data.chainData.programSellerTA;
		const subscriptionId = connection.onAccountChange(
			programTokenAccount,
			async (updatedAccountInfo) => {
				const programTokenAmount = Number(unpackAccount(programTokenAccount, updatedAccountInfo).amount);
				if (programTokenAmount === 0) setIsDeposited(true);
			},
			'confirmed'
		);
		return () => {
			connection.removeAccountChangeListener(subscriptionId);
		};
	}, [connection, isLong, rateStateQuery.data.chainData.programBuyerTA, rateStateQuery.data.chainData.programSellerTA]);

	const onClaimClick = async () => {
		try {
			setIsLoading(true);
			const tx = await claim(provider, new PublicKey(otcStatePubkey));
			await txHandler.handleTxs(tx);
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
			rateStateQuery.refetch();
		}
	};
	if (isDeposited) {
		return <></>;
	} else if (isLong) {
		if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.chainData.isClaimLongAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.chainData.isClaimShortAvailable(wallet.publicKey)) {
		return <></>;
	}

	return <ButtonPill mode="info" text="Claim" onClick={onClaimClick} loading={isLoading} />;
};

export default ClaimButton;

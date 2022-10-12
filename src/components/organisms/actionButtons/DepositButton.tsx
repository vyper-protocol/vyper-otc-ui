/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { checkTokenAmount } from 'utils/solanaHelper';

const DepositButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const checkTokenAmountHelper = useCallback(async()=>{
		const res = await checkTokenAmount(connection, wallet.publicKey, new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W'), isBuyer ? rateStateQuery.data.buyerDepositAmount : rateStateQuery.data.sellerDepositAmount);
		console.log(res);
		setIsButtonDisabled(!res);
	}, [connection, wallet.publicKey, isBuyer, rateStateQuery.data.buyerDepositAmount, rateStateQuery.data.sellerDepositAmount]);

	useEffect(()=>{
		checkTokenAmountHelper();
	}, [checkTokenAmountHelper]);

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

	return <ButtonPill mode={isBuyer ? 'success' : 'error'} text={isBuyer ? 'Long' : 'Short'} onClick={onDepositClick} loading={isLoading} disabled={isButtonDisabled} />;
};

export default DepositButton;

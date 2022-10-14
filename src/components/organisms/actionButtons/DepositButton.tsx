/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from 'react';

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { deposit } from 'api/otc-state/deposit';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { Tooltip } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { getTokenAmount } from 'utils/solanaHelper';

const DepositButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const checkTokenAmount = useCallback(async()=>{
		try{
			const requiredAmount = isBuyer ? rateStateQuery.data.buyerDepositAmount : rateStateQuery.data.sellerDepositAmount;
			const mintInfo = rateStateQuery.data.reserveMintInfo;
			const tokenAmount = await getTokenAmount(connection, wallet.publicKey, mintInfo.address);
			if(tokenAmount / BigInt(10 ** mintInfo.decimals) >= requiredAmount) setIsButtonDisabled(false);
			else setIsButtonDisabled(true);
		}catch(err) {
			console.error(err);
		}
	}, [isBuyer, rateStateQuery.data.buyerDepositAmount, rateStateQuery.data.sellerDepositAmount, rateStateQuery.data.reserveMintInfo, connection, wallet.publicKey]);

	useEffect(()=>{
		checkTokenAmount();
	}, [checkTokenAmount]);

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
		<Tooltip isShown={!isButtonDisabled ? false : undefined} content="Not enough tokens">
			<ButtonPill mode={isBuyer ? 'success' : 'error'} text={isBuyer ? 'Long' : 'Short'} onClick={onDepositClick} loading={isLoading} disabled={isButtonDisabled} />
		</Tooltip>
	);
};

export default DepositButton;

import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claim } from 'api/otc-state/claim';
import { deposit } from 'api/otc-state/deposit';
import ButtonPill from 'components/atoms/ButtonPill/ButtonPill';
import { PlusIcon } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { OtcState } from 'models/OtcState';
import { TxHandlerContext } from 'providers/TxHandlerProvider';
import { useContext, useState } from 'react';

const ClaimButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(provider, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);

	const onClaimClick = async (e) => {
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

	if (isBuyer) {
		if (rateStateQuery?.data == undefined || !rateStateQuery?.data?.isClaimSeniorAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else {
		if (rateStateQuery?.data == undefined || !rateStateQuery?.data?.isClaimJuniorAvailable(wallet.publicKey)) {
			return <></>;
		}
	}

	return (
		<ButtonPill
			mode={isBuyer ? 'success' : 'error'}
			text={isBuyer ? 'Claim buyer' : 'Claim seller'}
			onClick={onClaimClick}
			icon={<PlusIcon />}
			loading={isLoading}
		/>
	);
};

export default ClaimButton;

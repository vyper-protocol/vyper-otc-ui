import { useContext, useState } from 'react';

import { CircularProgress } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { airdrop } from 'api/dummy-tokens/airdrop';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { BsFillCloudArrowDownFill } from 'react-icons/bs';
import { toast } from 'react-toastify';

const AirdropButton = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const onAirdropClick = async () => {
		setIsLoading(true);

		try {
			const tx = await airdrop(connection, wallet.publicKey);
			await txHandler.handleTxs([tx]);

			toast.success('Airdrop completed');
		} catch (err) {
			// console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	if (!wallet.connected) return <></>;

	return <div onClick={onAirdropClick}>{isLoading ? <CircularProgress size={20} /> : <BsFillCloudArrowDownFill size="20px" />} Airdrop</div>;
};

export default AirdropButton;

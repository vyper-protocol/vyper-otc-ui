import { useContext, useState } from 'react';

import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { CircularProgress, Tooltip } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { airdrop } from 'api/dummy-tokens/airdrop';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
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

	if (isLoading) return <CircularProgress size={24} />;

	return (
		<Tooltip title="Airdrop tokens">
			<div onClick={onAirdropClick} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<CloudDownloadIcon />
				<p>Airdrop</p>
			</div>
		</Tooltip>
	);
};

export default AirdropButton;

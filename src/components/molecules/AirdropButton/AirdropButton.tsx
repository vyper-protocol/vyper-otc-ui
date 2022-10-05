import { useContext, useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { airdrop } from 'api/dummy-tokens/airdrop';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { Text, CloudDownloadIcon, Spinner, toaster, Tooltip } from 'evergreen-ui';

const AirdropButton = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const onAirdropClick = async () => {
		setIsLoading(true);

		try {
			const tx = await airdrop(connection, wallet.publicKey);
			await txHandler.handleTxs(tx);

			toaster.success('Airdrop completed');
		} catch (err) {
			// console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	if (!wallet.connected) return <></>;

	if (isLoading) return <Spinner size={24} />;

	return (
		<Tooltip content="Airdrop tokens">
			<Text onClick={onAirdropClick}>
				<CloudDownloadIcon /> Airdrop
			</Text>
		</Tooltip>
	);
};

export default AirdropButton;

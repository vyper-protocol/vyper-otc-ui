import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ChevronDownIcon } from 'evergreen-ui';

import { abbreviateAddress } from '../../../utils/stringHelpers';
import styles from './SelectWallet.module.scss';

const SelectWallet = () => {
	const wallet = useWallet();

	return !wallet.connected ? (
		<WalletMultiButton className={styles.button} />
	) : (
		<WalletMultiButton className={styles.button}>
			<div>
				<p>
					{abbreviateAddress(wallet.publicKey.toString())} <ChevronDownIcon />
				</p>
				<p>
					{wallet.wallet.adapter.name} <span className={styles.active_badge}></span>
				</p>
			</div>
		</WalletMultiButton>
	);
};

export default SelectWallet;

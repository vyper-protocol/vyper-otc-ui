import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import PulseStatus from 'components/atoms/ButtonPill/PulseStatus/PulseStatus';
import { ChevronDownIcon } from 'evergreen-ui';

import { abbreviateAddress } from '../../../utils/stringHelpers';
import styles from './SelectWallet.module.scss';

const SelectWallet = () => {
	const wallet = useWallet();

	return !wallet.connected ? (
		<WalletMultiButton className={styles.button} />
	) : (
		<>
			<WalletMultiButton className={styles.button}>
				<div>
					<div className={styles.flex_center}>
						<div>{abbreviateAddress(wallet.publicKey.toString())}</div>
						<ChevronDownIcon className={styles.fit} />
					</div>
					<div className={styles.flex_center}>
						<div className={styles.disabled}>{wallet.wallet.adapter.name}</div> <PulseStatus />
					</div>
				</div>
			</WalletMultiButton>
		</>
	);
};

export default SelectWallet;

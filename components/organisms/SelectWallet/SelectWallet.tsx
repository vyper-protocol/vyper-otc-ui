import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import styles from './SelectWallet.module.scss';

const SelectWallet = () => {
	return <WalletMultiButton className={styles.button} />;
};

export default SelectWallet;

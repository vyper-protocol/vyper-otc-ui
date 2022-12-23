import styles from './SelectWallet.module.scss';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const SelectWallet = () => {
	return <WalletMultiButtonDynamic className={styles.button} />;
};

export default SelectWallet;

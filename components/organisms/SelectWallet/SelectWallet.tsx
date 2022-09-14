import { Fragment, useRef } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
	Button,
	ChevronDownIcon,
	DocumentOpenIcon,
	HandIcon,
	OfflineIcon,
	Pane,
	Popover,
	SymbolDiamondIcon
} from 'evergreen-ui';
import { getExplorerLink } from 'utils/clusterHelpers';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import styles from './SelectWallet.module.scss';

const SelectWallet = () => {
	const wallet = useWallet();
	const walletModal = useWalletModal();

	const openExplorerAnchor = useRef<HTMLAnchorElement>(null);

	const handleCopyAddress = async () => {
		copyToClipboard(wallet.publicKey.toString());
	};
	const handleOpenInExplorer = () => {
		const explorerLink = getExplorerLink('address', wallet.publicKey.toString(), 'devnet');
		openExplorerAnchor.current.href = explorerLink;
		openExplorerAnchor.current.click();
	};

	const handleChangeWallet = () => {
		walletModal.setVisible(true);
	};

	const walletMenu = [
		{
			title: 'Copy Address',
			handleEvent: handleCopyAddress,
			icon: <HandIcon />
		},
		{
			title: 'Open in Explorer',
			handleEvent: handleOpenInExplorer,
			icon: <DocumentOpenIcon />
		},
		{
			title: 'Change Wallet',
			handleEvent: handleChangeWallet,
			icon: <SymbolDiamondIcon />
		},
		{
			title: 'Disconnect',
			handleEvent: wallet.disconnect,
			icon: <OfflineIcon />
		}
	];

	return (
		<Fragment>
			{!wallet.connected && (
				<Button>
					<WalletMultiButton />
				</Button>
			)}

			{wallet.connected && (
				<Pane>
					<Popover
						content={
							<>
								<p>Wallet Settings</p>
								<hr />
								<a
									ref={openExplorerAnchor}
									target="_blank"
									rel="noopener noreferrer"
									className={styles.hidden_anchor}
								></a>
								{walletMenu.map((walletOption) => {
									return (
										<div onClick={walletOption.handleEvent} key={walletOption.title}>
											{walletOption.icon} {walletOption.title}
										</div>
									);
								})}
							</>
						}
					>
						<Button className={styles.wallet}>
							<div>
								<img src={wallet.wallet.adapter.icon} className={styles.walletLogo} />
							</div>
							<div>
								<div>
									{abbreviateAddress(wallet.publicKey.toString(), 6)}

									<ChevronDownIcon />
								</div>
								<div>
									{wallet.wallet.adapter.name} Wallet
									<span className={styles.active_badge}></span>
								</div>
							</div>
						</Button>
					</Popover>
				</Pane>
			)}
		</Fragment>
	);
};

export default SelectWallet;

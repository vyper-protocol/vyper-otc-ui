/* eslint-disable css-modules/no-unused-class */
import { ReactNode } from 'react';

import { StatusIndicator, toaster } from 'evergreen-ui';
import { IContract } from 'models/Contract';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import styles from './StatsPanel.module.scss';

type StatsPanelProps = {
	contract: IContract;
	buttons: ReactNode;
};

const StatsPanel = ({ contract, buttons }: StatsPanelProps) => {
	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	return (
		<>
			<div className={styles.box}>
				<div className={styles.title}>
					<h5 className={styles.symbol}>{contract.asset}</h5>
					{contract.pubkey && (
						<p className={styles.disabled} onClick={handleAddressClick} data-id={contract.pubkey.toString()}>
							{abbreviateAddress(contract.pubkey.toString())}
						</p>
					)}
				</div>

				<div className={styles.funded}>
					<StatusIndicator color={!contract.conditions.isDepositSeniorAvailable ? 'success' : 'danger'}>
						{!contract.conditions.isDepositSeniorAvailable ? 'Senior Funded' : 'Senior not Funded'}
					</StatusIndicator>
					<StatusIndicator color={!contract.conditions.isDepositJuniorAvailable ? 'success' : 'danger'}>
						{!contract.conditions.isDepositJuniorAvailable ? 'Junior Funded' : 'Junior not Funded'}
					</StatusIndicator>
				</div>
				<hr />
				<div className={styles.content}>
					{contract.stats.map((mockItem) => {
						return (
							<div key={mockItem.name} className={styles.column}>
								<p>{mockItem.name}</p>
								<p>{mockItem.value}</p>
							</div>
						);
					})}
				</div>
				<hr />

				{contract.timestamps.map((timestamp) => {
					return (
						<div key={timestamp.name} className={styles.expirations}>
							<div>
								<p>{timestamp.name}</p>
							</div>
							<div>
								<p>{timestamp.value}</p>
							</div>
						</div>
					);
				})}

				{buttons}
			</div>
		</>
	);
};

export default StatsPanel;

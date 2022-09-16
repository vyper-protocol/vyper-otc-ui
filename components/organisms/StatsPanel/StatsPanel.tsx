import { Badge, StatusIndicator, toaster } from 'evergreen-ui';
import { IContract } from 'models/Contract';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import styles from './StatsPanel.module.scss';

type StatsPanelProps = {
	contract: IContract;
};

const StatsPanel = ({ contract }: StatsPanelProps) => {
	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	const hasSeniorDeposited = contract.amounts.seniorDepositAmount !== 0;
	const hasJuniorDeposited = contract.amounts.juniorDepositAmount !== 0;

	return (
		<>
			<div className={styles.title}>
				<h5 className={styles.symbol}>{contract.asset}</h5>
				{contract.pubkey && (
					<p className={styles.disabled} onClick={handleAddressClick} data-id={contract.pubkey.toString()}>
						{abbreviateAddress(contract.pubkey.toString())}
					</p>
				)}
			</div>

			<div className={styles.funded}>
				<StatusIndicator color={hasSeniorDeposited ? 'success' : 'danger'}>
					{hasSeniorDeposited ? 'Senior Funded' : 'Senior not Funded'}
				</StatusIndicator>
				<StatusIndicator color={hasJuniorDeposited ? 'success' : 'danger'}>
					{hasJuniorDeposited ? 'Junior Funded' : 'Junior not Funded'}
				</StatusIndicator>
			</div>
			<div className={styles.box}>
				<div className={styles.content}>
					{contract.stats.map((mockItem) => {
						return (
							<div key={mockItem.name} className={styles.column}>
								<p>{mockItem.name}</p>
								<Badge color="purple" marginRight={8} paddingTop={2}>
									{mockItem.value}
								</Badge>
							</div>
						);
					})}
				</div>
				<hr />
				<div className={styles.expirations}>
					<div>
						<p>Deposit expire</p>
						<p>{contract.timestamps.depositExpiraton}</p>
					</div>
					<div className={styles.left}>
						<p>Settle available</p>
						<p>{contract.timestamps.settleAvailable}</p>
					</div>
				</div>
			</div>
			<p className={styles.created}> Created at {contract.timestamps.createdAt}</p>
		</>
	);
};

export default StatsPanel;

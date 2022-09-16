import cn from 'classnames';
import { Button, Pane, Text, toaster } from 'evergreen-ui';
import { abbreviateAddress, copyToClipboard } from 'utils/stringHelpers';

import styles from './StatsPanel.module.scss';

const mockMainData = [
	{
		name: 'Asset Price',
		value: 32.5
	},
	{
		name: 'Collateral',
		value: 1000
	},
	{
		name: 'Duration',
		value: '7 days'
	},
	{
		name: 'Strike',
		value: 32.5
	}
];

const mockBeneficiaryData = [
	{
		name: 'Junior Token',
		pubkey: abbreviateAddress('5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc')
	},
	{
		name: 'Junior Owner',
		pubkey: abbreviateAddress('5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc')
	},
	{
		name: 'Senior Token',
		pubkey: abbreviateAddress('5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc')
	},
	{
		name: 'Senior Owner',
		pubkey: abbreviateAddress('5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc')
	}
];

const StatsPanel = () => {
	const handleAddressClick = (e) => {
		copyToClipboard(e.target.getAttribute('data-id'));
		toaster.notify('Address copied to clipboard', {
			duration: 1
		});
	};

	return (
		<Pane className={styles.panel}>
			<Pane className={styles.header}>
				<Text float="right" color="white" fontWeight={600}>
					Created at 02.03.22
				</Text>
				<Pane className={styles.title}>
					<Text fontSize={20} fontWeight={600} color="white">
						BTC-CHF
					</Text>
					<Text
						className={styles.clickable}
						color="#516070"
						onClick={handleAddressClick}
						data-id="5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc"
					>
						{abbreviateAddress('5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc')}
					</Text>
				</Pane>
				<Pane className={cn(styles.column, styles.header_info)}>
					<Text color="#00d395" fontWeight={600}>
						Deposit exp: in 1 day
					</Text>
					<Text color="#00d395" fontWeight={600}>
						Settle available: in 5 days
					</Text>
				</Pane>
			</Pane>

			<Pane className={styles.content}>
				{mockMainData.map((item) => {
					return (
						<Pane key={item.name} className={styles.column} marginBottom={10}>
							<Text color="#8b9cad" fontWeight={600}>
								{item.name}
							</Text>
							<Text color="#8b9cad" fontWeight={600}>
								{item.value}
							</Text>
						</Pane>
					);
				})}
			</Pane>

			<Pane className={styles.footer}>
				{mockBeneficiaryData.map((item) => {
					return (
						<Pane key={item.name} className={styles.column} marginBottom={5}>
							<Text color="#516070" fontWeight={600}>
								{item.name}
							</Text>
							<Text className={styles.clickable} onClick={handleAddressClick} color="#9669ed" data-id={item.pubkey}>
								{item.pubkey}
							</Text>
						</Pane>
					);
				})}
			</Pane>

			<Pane className={styles.buttons}>
				<Button width="100%" appearance="primary" intent="success" borderRadius={0} height={60}>
					Deposit Senior
				</Button>
				<Button width="100%" appearance="primary" intent="danger" borderRadius={0} height={60}>
					Deposit Junior
				</Button>
			</Pane>
		</Pane>
	);
};

export default StatsPanel;

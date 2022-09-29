import { useState } from 'react';

import cn from 'classnames';
import rpcEndpoints from 'configs/rpc_endpoints.json';
import { SettingsIcon, Pane, RadioGroup, Popover } from 'evergreen-ui';

import styles from './ClusterSelector.module.scss';

type ClusterSelectorProps = {
	className?: string;
};

// TODO create background overlay
const ClusterSelector = ({ className }: ClusterSelectorProps) => {
	const [clusters] = useState([
		{ label: 'Devnet', value: 'Devnet' },
		{ label: 'Mainnet', value: 'Mainnet' }
	]);
	const [selectedCluster, setSelectedCluster] = useState('Devnet');

	const handleClusterSwitch = (event) => {
		return setSelectedCluster(event.target.value);
	};

	const popupContent = (
		<Pane width={220} height={220} padding={20} display="flex" flexDirection="column">
			<h6>Settings</h6>
			<RadioGroup
				label="Clusters"
				size={16}
				value={selectedCluster}
				options={clusters}
				onChange={handleClusterSwitch}
				marginTop={20}
			/>
		</Pane>
	);

	return (
		<>
			<Popover bringFocusInside content={popupContent}>
				<div className={cn(styles.wrapper, className)}>
					<SettingsIcon />
				</div>
			</Popover>
		</>
	);
};

export default ClusterSelector;

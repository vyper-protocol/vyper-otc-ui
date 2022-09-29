import { useState } from 'react';

import cn from 'classnames';
import { SettingsIcon, Pane, RadioGroup, Popover, toaster } from 'evergreen-ui';
import { useClusterStore } from 'store/clusterStore';

import styles from './ClusterSelector.module.scss';

type ClusterSelectorProps = {
	className?: string;
};

// TODO create background overlay
const ClusterSelector = ({ className }: ClusterSelectorProps) => {
	const clusterStore = useClusterStore((state) => {
		return state;
	});

	const [clusters] = useState([
		{ label: 'Devnet', value: 'devnet' },
		{ label: 'Mainnet-beta', value: 'mainnet-beta' }
	]);
	const [selectedCluster, setSelectedCluster] = useState(clusterStore.cluster);

	const handleClusterSwitch = (event) => {
		setSelectedCluster(event.target.value);
		clusterStore.switchCluster(event.target.value);
		toaster.notify(`Network updated to ${event.target.value}`, {
			duration: 3
		});
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

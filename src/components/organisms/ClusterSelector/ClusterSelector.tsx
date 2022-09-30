import { useEffect, useState } from 'react';

import cn from 'classnames';
import { SettingsIcon, Pane, RadioGroup, Popover, toaster } from 'evergreen-ui';
import { useRouter } from 'next/router';

import styles from './ClusterSelector.module.scss';

type ClusterSelectorProps = {
	className?: string;
};

const ClusterSelector = ({ className }: ClusterSelectorProps) => {
	const router = useRouter();
	const { cluster } = router.query;

	const [clusters] = useState([
		{ label: 'Devnet', value: 'devnet' },
		{ label: 'Mainnet-beta', value: 'mainnet-beta' }
	]);
	const [selectedCluster, setSelectedCluster] = useState(cluster);

	useEffect(() => {
		if (selectedCluster) {
			const cleanParams = router.asPath.split('?');
			const routeWithParams = cleanParams[0].concat('?cluster=', selectedCluster as string);

			router.push(routeWithParams);
		}
	}, [selectedCluster]);

	const handleClusterSwitch = (event) => {
		setSelectedCluster(event.target.value);

		toaster.notify(`Network updated to ${event.target.value}`, {
			duration: 3
		});
	};

	const popupContent = (
		<Pane width={220} height={220} padding={20} display="flex" flexDirection="column">
			<h6>Settings</h6>
			<RadioGroup label="Clusters" size={16} value={selectedCluster as string} options={clusters} onChange={handleClusterSwitch} marginTop={20} />
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

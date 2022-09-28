import cn from 'classnames';
import { SettingsIcon } from 'evergreen-ui';

import styles from './ClusterSelector.module.scss';

type ClusterSelectorProps = {
	className?: string;
};

const ClusterSelector = ({ className }: ClusterSelectorProps) => {
	return (
		<div className={cn(styles.wrapper, className)}>
			<SettingsIcon />
		</div>
	);
};

export default ClusterSelector;

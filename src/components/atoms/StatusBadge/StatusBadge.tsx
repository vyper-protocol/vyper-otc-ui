/* eslint-disable css-modules/no-unused-class */
import { Chip } from '@mui/material';

import styles from './StatusBadge.module.scss';

type StatusBadgeProps = {
	// The text content of the chip
	label: string;

	// The mode that specifies the color of the chip
	mode: 'dark' | 'info' | 'success' | 'warning' | 'error';
};

const StatusBadge = ({ label, mode }: StatusBadgeProps) => {
	return (
		<div className={styles.chip}>
			<Chip className={styles[mode]} sx={{ borderRadius: 1, fontSize: 11 }} label={label} size="small" variant="filled" />
		</div>
	);
};

export default StatusBadge;

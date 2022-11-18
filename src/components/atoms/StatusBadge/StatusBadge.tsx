/* eslint-disable css-modules/no-unused-class */
import { Chip } from '@mui/material';
import cn from 'classnames';

import styles from './StatusBadge.module.scss';

type StatusBadgeProps = {
	// The text content of the chip
	label: string;

	// The mode that specifies the color of the chip
	mode: 'dark' | 'info' | 'success' | 'warning' | 'error';
};

const StatusBadge = ({ label, mode }: StatusBadgeProps) => {
	return <Chip className={cn(styles.chip, styles[mode])} label={label} size="small" variant="filled" />;
};

export default StatusBadge;

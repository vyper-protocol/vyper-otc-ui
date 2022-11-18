/* eslint-disable css-modules/no-unused-class */
import { Chip } from '@mui/material';
import cn from 'classnames';

import styles from './NumericBadge.module.scss';

type NumericBadgeProps = {
	// The text content of the chip
	label: string;

	// The mode that specifies the color of the chip
	mode: 'success' | 'error';
};

const NumericBadge = ({ label, mode }: NumericBadgeProps) => {
	return <Chip className={cn(styles.chip, styles[mode])} label={label} size="small" variant="filled" />;
};

export default NumericBadge;

/* eslint-disable css-modules/no-unused-class */
import { Chip } from '@mui/material';

import styles from './NumericBadge.module.scss';

type NumericBadgeProps = {
	// The text content of the chip
	label: string;

	// The mode that specifies the color of the chip
	mode: 'success' | 'error';
};

const NumericBadge = ({ label, mode }: NumericBadgeProps) => {
	return (
		<div className={styles.chip}>
			<Chip className={styles[mode]} label={label} sx={{ borderRadius: 1, fontSize: 14 }} size="small" variant="filled" />
		</div>
	);
};

export default NumericBadge;

/* eslint-disable css-modules/no-unused-class */
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import cn from 'classnames';

import styles from './BooleanBadge.module.scss';

type BooleanBadgeProps = {
	success: boolean;
};

const BooleanBadge = ({ success }: BooleanBadgeProps) =>
	success ? <DoneIcon className={cn(styles.icon, styles.success)} /> : <CloseIcon className={cn(styles.icon, styles.fail)} />;

export default BooleanBadge;

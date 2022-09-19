/* eslint-disable css-modules/no-unused-class */
import cn from 'classnames';
import { Button } from 'evergreen-ui';

import styles from './ButtonPill.module.scss';

type ButtonPillProps = {
	text: string;
	mode: 'success' | 'error' | 'info';
	icon?: any;
	loading?: boolean;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const ButtonPill = ({ text, onClick, mode = 'info', icon, loading }: ButtonPillProps) => {
	return (
		<Button
			className={cn(styles.button, styles[mode], loading && styles.disabled)}
			onClick={onClick}
			appearance="primary"
			iconBefore={icon}
			isLoading={loading}
		>
			{text}
		</Button>
	);
};

export default ButtonPill;

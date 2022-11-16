/* eslint-disable css-modules/no-unused-class */
import cn from 'classnames';
import { Button } from 'evergreen-ui';

import styles from './ButtonPill.module.scss';

type ButtonPillProps = {
	/**
	 * The text content of the button
	 */
	text: string;

	/**
	 * The mode that specifies the color of the button
	 */
	mode: 'success' | 'error' | 'info' | 'disabled';

	/**
	 * Additional props for icon that will be added in the left side of the button
	 */
	icon?: any;

	/**
	 * Shows a spinner to display a loading state when set to true
	 */
	loading?: boolean;
	disabled?: boolean;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const ButtonPill = ({ text, onClick, mode = 'info', icon, loading, disabled }: ButtonPillProps) => {
	return (
		<Button
			className={cn(styles.button, styles[mode], loading && styles.disabled)}
			onClick={onClick}
			appearance="primary"
			iconBefore={icon}
			isLoading={loading}
			disabled={disabled}
		>
			{text}
		</Button>
	);
};

export default ButtonPill;

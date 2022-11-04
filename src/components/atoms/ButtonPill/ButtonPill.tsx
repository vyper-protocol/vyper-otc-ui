/* eslint-disable css-modules/no-unused-class */
import { Button, CircularProgress, styled } from '@mui/material';
import cn from 'classnames';

import styles from './ButtonPill.module.scss';

type ButtonPillProps = {
	/**
	 * The text content of the button
	 */
	text: string;

	/**
	 * The mode that specifies the color of the button
	 */
	mode: 'success' | 'error' | 'info';

	/**
	 * Additional props for icon that will be added in the left side of the button
	 */
	icon?: any;

	/**
	 * Shows a spinner to display a loading state when set to true
	 */
	loading?: boolean;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const StyledButton = styled(Button)(`
  text-transform: none;
`);

const ButtonPill = ({ text, onClick, mode = 'info', icon, loading }: ButtonPillProps) => {
	return (
		<StyledButton className={cn(styles.button, styles[mode], loading && styles.disabled)} onClick={onClick} startIcon={icon} disabled={loading}>
			{loading ? <CircularProgress className={styles.progress} size={16} /> : null}
			{text}
		</StyledButton>
	);
};

export default ButtonPill;

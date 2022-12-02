import { ReactNode, useState } from 'react';

import { Tooltip } from '@mui/material';

import styles from './ClickableIcon.module.scss';

type ClickableIconProps = {
	onClick: () => void;
	label: string;
	clickedLabel?: string;
	children: ReactNode;
};

const ClickableIcon = ({ onClick, label, clickedLabel, children }: ClickableIconProps) => {
	const [title, setTitle] = useState(label);

	const onIconClick = () => {
		setTitle(clickedLabel ?? label);
		onClick();
	};

	const onOpen = () => {
		setTitle(label);
	};

	return (
		<Tooltip title={title} className={styles.icon} arrow onClick={onIconClick} onOpen={onOpen}>
			<span>{children}</span>
		</Tooltip>
	);
};

export default ClickableIcon;

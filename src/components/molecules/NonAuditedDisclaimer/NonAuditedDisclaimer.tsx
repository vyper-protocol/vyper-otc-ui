import { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, Box, IconButton } from '@mui/material';
import cn from 'classnames';

import styles from './NonAuditedDisclaimer.module.scss';

const NonAuditedDisclaimer = () => {
	const [isVisible, setIsVisible] = useState(true);

	const onCloseButtonClick = () => {
		setIsVisible(false);
	};

	return (
		<Alert
			sx={{ maxWidth: '800px' }}
			className={cn(!isVisible && styles.hidden)}
			severity="warning"
			action={
				<IconButton
					aria-label="close"
					color="inherit"
					size="small"
					onClick={() => {
						onCloseButtonClick();
					}}
				>
					<CloseIcon fontSize="inherit" />
				</IconButton>
			}
		>
			<AlertTitle>Warning</AlertTitle>
			Vyper OTC and related smart contracts are currently in open alpha. The software is unaudited so use it at your own risk. The code is open source and
			available on{' '}
			<a href="https://github.com/vyper-protocol/vyper-otc" target="_blank" rel="noreferrer">
				GitHub
			</a>{' '}
			for review.
		</Alert>
	);
};

export default NonAuditedDisclaimer;

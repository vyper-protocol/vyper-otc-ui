import { ReactNode } from 'react';

import { Alert } from '@mui/material';

type MessageAlertProps = {
	// The message of the alert
	message: string;

	// severity of the alert
	severity: 'success' | 'info' | 'warning' | 'error';

	children?: ReactNode;
};

const MessageAlert = ({ message, severity, children = <></> }: MessageAlertProps) => {
	return (
		<Alert sx={{ backgroundColor: 'rgba(0,0,0,0)', p: 0 }} severity={severity}>
			{message}
			{children}
		</Alert>
	);
};

export default MessageAlert;

import { Alert } from '@mui/material';

type ErrorAlertProps = {
	// The message of the alert
	message: string;
};

const ErrorAlert = ({ message }: ErrorAlertProps) => {
	return (
		<Alert sx={{ backgroundColor: 'rgba(0,0,0,0)', my: 1 }} severity="error">
			{message}
		</Alert>
	);
};

export default ErrorAlert;

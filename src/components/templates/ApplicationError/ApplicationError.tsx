import { Box, Button, styled, Typography } from '@mui/material';
import { FallbackProps } from 'react-error-boundary';

import Icon from '../../atoms/Icon';
import Layout from '../Layout';
import styles from './ApplicationError.module.scss';

const StyledButton = styled(Button)(`
  text-transform: none;
`);

const ApplicationError = ({ resetErrorBoundary }: FallbackProps) => {
	return (
		<Layout>
			<Box className={styles.container}>
				<div className={styles.title}>
					<Icon name="AiFillWarning" size={24} />
					<Typography variant="h5">Application Error</Typography>
				</div>
				<Typography>Vyper OTC encountered an application error.</Typography>
				<StyledButton variant="outlined" onClick={resetErrorBoundary}>
					Try Again
				</StyledButton>
			</Box>
		</Layout>
	);
};

export default ApplicationError;

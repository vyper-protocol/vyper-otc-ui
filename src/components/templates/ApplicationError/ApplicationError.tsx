import { Button, Heading, Pane, Paragraph, WarningSignIcon } from 'evergreen-ui';
import { FallbackProps } from 'react-error-boundary';

import Layout from '../Layout';
import styles from './ApplicationError.module.scss';

const ApplicationError = ({ resetErrorBoundary }: FallbackProps) => {
	return (
		<Layout>
			<Pane className={styles.container}>
				<div className={styles.title}>
					<WarningSignIcon size={20} />
					<Heading size={800}>Application Error</Heading>
				</div>
				<Paragraph>Vyper OTC encountered an application error.</Paragraph>
				<Button onClick={resetErrorBoundary}>Try Again</Button>
			</Pane>
		</Layout>
	);
};

export default ApplicationError;

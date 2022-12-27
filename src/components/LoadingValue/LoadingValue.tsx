import { ReactNode } from 'react';

import { Skeleton } from '@mui/material';

type LoadingValueProps = {
	isLoading: boolean;
	children: ReactNode;
};

const LoadingValue = ({ isLoading, children }: LoadingValueProps) => {
	return isLoading ? (
		<Skeleton sx={{ display: 'inline-block' }}>
			<span>{children}</span>
		</Skeleton>
	) : (
		<span>{children}</span>
	);
};

export default LoadingValue;

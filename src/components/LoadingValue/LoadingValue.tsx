import { ReactNode } from 'react';

import { Skeleton } from '@mui/material';

type LoadingValueProps = {
	isLoading: boolean;
	children: ReactNode;
};

const LoadingValue = ({ isLoading, children }: LoadingValueProps) => {
	return isLoading ? <Skeleton>{children}</Skeleton> : <span>{children}</span>;
};

export default LoadingValue;

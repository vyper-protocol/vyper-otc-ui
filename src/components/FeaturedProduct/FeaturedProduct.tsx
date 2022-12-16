import { ReactNode } from 'react';

import { Box } from '@mui/material';
import Layout from 'components/templates/Layout';

interface FeaturedProductProps {
	pageTitle: string;
	title: string;
	children: ReactNode;
}

const FeaturedProduct = ({ pageTitle, title, children }: FeaturedProductProps) => {
	return (
		<Layout pageTitle={pageTitle}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<h1>{title}</h1>
				<Box sx={{ display: 'flex', flexDirection: 'row' }}>{children}</Box>
			</Box>
		</Layout>
	);
};

export default FeaturedProduct;

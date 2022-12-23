import { ReactNode } from 'react';

import { Box } from '@mui/material';
import Layout from 'components/templates/Layout';
import TradingViewSymbol from 'components/TradingViewSymbol';

interface FeaturedProductProps {
	pageTitle: string;
	symbol: string;
	children: ReactNode;
}

const FeaturedProduct = ({ pageTitle, symbol, children }: FeaturedProductProps) => {
	return (
		<Layout pageTitle={pageTitle}>
			<Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}>
				<Box sx={{ display: 'flex', flexDirection: 'row', px: 1 }}>
					{children}
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						<Box sx={{ width: '40vw', height: '500px' }}>
							<TradingViewSymbol symbol={symbol} />
						</Box>
					</Box>
				</Box>
			</Box>
		</Layout>
	);
};

export default FeaturedProduct;

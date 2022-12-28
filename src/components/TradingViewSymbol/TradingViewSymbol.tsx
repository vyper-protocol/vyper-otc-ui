/* eslint-disable camelcase */
// import { AdvancedChart } from 'react-tradingview-embed';
import dynamic from 'next/dynamic';

const DynamicAdvancedChart = dynamic(import('react-tradingview-embed/dist/components/SymbolOverview'), { ssr: false });

interface TradingViewSymbolProps {
	symbol: string;
}

const TradingViewSymbol = ({ symbol }: TradingViewSymbolProps) => {
	return (
		<DynamicAdvancedChart
			widgetProps={{
				symbols: symbol,
				colorTheme: 'dark',
				width: '100%',
				height: '100%'
				// isTransparent: true
			}}
		/>
	);
};

export default TradingViewSymbol;

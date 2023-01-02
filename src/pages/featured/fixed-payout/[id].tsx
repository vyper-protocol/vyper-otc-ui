import FeaturedFixedPayout from 'components/FeaturedFixedPayout';
import featured from 'configs/featured.json';
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: featured.featured
			.filter(({ id }) => id && id.includes('fixed-payout'))
			.map(({ id }) => {
				return {
					params: {
						id: id.split('/').pop()
					}
				};
			}),
		fallback: false
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const matched = featured.featured.find(({ id }) => id === 'fixed-payout/' + params.id);
	return {
		props: {
			ticker: matched?.ticker ?? '',
			title: matched?.title ?? '',
			oracleTitle: matched?.oracle ?? ''
		}
	};
};

interface FixedPayoutPageProps {
	ticker: string;
	title: string;
	oracleTitle: string;
}

const FixedPayoutPage = ({ ticker, title, oracleTitle }: FixedPayoutPageProps) => {
	return <FeaturedFixedPayout ticker={ticker} title={title} oracleTitle={oracleTitle} />;
};

export default FixedPayoutPage;

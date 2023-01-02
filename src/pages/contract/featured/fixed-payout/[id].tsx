import FeaturedFixedPayout from 'components/FeaturedFixedPayout';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import resources from 'configs/resources.json';
import { GetStaticProps, GetStaticPaths } from 'next';
import Custom404Page from 'pages/404';

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: resources.featured
			.filter(({ id }) => id.includes('fixed-payout'))
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
	return {
		props: {
			pubkey: resources.featured.find(({ id }) => id === 'fixed-payout/' + params.id)?.pubkey ?? ''
		}
	};
};

interface FixedPayoutPageProps {
	pubkey: string;
}

const FixedPayoutPage = ({ pubkey }: FixedPayoutPageProps) => {
	return getCurrentCluster() === 'devnet' ? <FeaturedFixedPayout oraclePubkey={pubkey} /> : <Custom404Page />;
};

export default FixedPayoutPage;

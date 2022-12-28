import FeaturedFixedPayout from 'components/FeaturedFixedPayout';
import resources from 'configs/resources.json';
import { GetStaticProps, GetStaticPaths } from 'next';

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
	return <FeaturedFixedPayout oraclePubkey={pubkey} />;
};

export default FixedPayoutPage;

import BonkFixedPayout from 'components/BonkFixedPayout';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import Custom404Page from 'pages/404';

const BonkPage = () => {
	return getCurrentCluster() === 'devnet' ? (
		<Custom404Page />
	) : (
		<Layout pageTitle="BONK!">
			<BonkFixedPayout />
		</Layout>
	);
};

export default BonkPage;

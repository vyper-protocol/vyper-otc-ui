import FeaturedProduct from 'components/FeaturedProduct';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import SamoFixedPayout from 'components/SamoFixedPayout';
import Layout from 'components/templates/Layout';
import Custom404Page from 'pages/404';

const SamoPage = () => {
	return getCurrentCluster() === 'devnet' ? (
		<Custom404Page />
	) : (
		<Layout pageTitle="SAMO!">
			<SamoFixedPayout />
		</Layout>
	);
};

export default SamoPage;

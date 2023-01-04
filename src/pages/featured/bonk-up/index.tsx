import BonkFixedPayout from 'components/BonkFixedPayout';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Custom404Page from 'pages/404';

const BonkPage = () => {
	return getCurrentCluster() === 'devnet' ? <Custom404Page /> : <BonkFixedPayout pageTitle="BONK UP" isCall={true} strike={1.03} />;
};

export default BonkPage;

import BonkFixedPayout from 'components/BonkFixedPayout';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Custom404Page from 'pages/404';

const BonkPage = () => {
	return getCurrentCluster() === 'devnet' ? <Custom404Page /> : <BonkFixedPayout pageTitle="BONK DOWN" isCall={false} strike={0.97} />;
};

export default BonkPage;

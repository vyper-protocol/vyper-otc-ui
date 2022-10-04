import TopBar from 'components/organisms/TopBar';
import Footer from 'components/templates/Footer';
import Image from 'next/image';

import styles from './index.module.scss';

const Home = () => {
	return (
		<>
			<div className={styles.bg_wrapper}>
				<TopBar />
				<Image alt="abstract-colors" src="/background.jpg" layout="fill" objectFit="cover" quality={100} />
			</div>
			<div className={styles.text_wrapper}>
				<h2>VYPER OTC</h2>
				<p className={styles.text}>The Derivatives Solana Platform</p>
			</div>
			<Footer />
		</>
	);
};

export default Home;

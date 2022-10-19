import cn from 'classnames';
import NonAuditedDisclaimer from 'components/molecules/NonAuditedDisclaimer';
import Layout from 'components/templates/Layout';
import resources from 'configs/resources.json';
import Head from 'next/head';

import backgroundImage from '../../public/background.webp';
import styles from './index.module.scss';

const Home = () => {
	const telegram = resources.socialMedias.find((s) => {
		return s.name === 'Telegram';
	});

	return (
		<>
			<Head>
				<title>Vyper OTC</title>
			</Head>
			<Layout withSearch withBackgroundImage={backgroundImage}>
				<NonAuditedDisclaimer />

				<div className={cn(styles.text_wrapper, styles.subtext)}>
					<p>Wanna trade?</p>
					<p>
						Click{' '}
						<b>
							<a target="_blank" href={telegram.link} rel="noopener noreferrer">
								here
							</a>
						</b>{' '}
						to join our Telegram group 📨
						<br />
						and request for a quote on any asset
					</p>
				</div>
				<div className={cn(styles.text_wrapper, styles.title)}>
					<h2>VYPER OTC</h2>
					<p>Trade the untradable with permissionless derivatives</p>
				</div>
			</Layout>
		</>
	);
};

export default Home;

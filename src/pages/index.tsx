import { useState } from 'react';

import cn from 'classnames';
import NonAuditedDisclaimer from 'components/molecules/NonAuditedDisclaimer';
import SearchBar from 'components/molecules/SearchBar';
import TopBar from 'components/organisms/TopBar';
import Footer from 'components/templates/Footer';
import resources from 'configs/resources.json';
import { Pane } from 'evergreen-ui';
import Head from 'next/head';
import Image from 'next/image';

import backgroundImage from '../../public/background.webp';
import styles from './index.module.scss';

const Home = () => {
	const [searchValue, setSearchValue] = useState('');

	const telegram = resources.socialMedias.find((s) => {
		return s.name === 'Telegram';
	});

	return (
		<>
			<Head>
				<title>Vyper OTC</title>
			</Head>
			<Pane className="root">
				<div className={styles.bg_wrapper}>
					<TopBar />
					<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
					<Image alt="abstract-colors" src={backgroundImage} layout="fill" objectFit="cover" quality={50} priority style={{ zIndex: -1 }} />
				</div>
				<div className={styles.disclaimer_alert}>
					<NonAuditedDisclaimer />
				</div>
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
				<Footer />
			</Pane>
		</>
	);
};

export default Home;

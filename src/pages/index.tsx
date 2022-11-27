import { Box, Stack } from '@mui/material';
import cn from 'classnames';
import TemplateGrid from 'components/organisms/TemplateGrid';
import Layout from 'components/templates/Layout';
import Head from 'next/head';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './index.module.scss';
import resources from 'configs/resources.json';

const Home = () => {
	const telegram = resources.socialMedias.find((s) => {
		return s.name === 'Telegram';
	});

	const github = resources.socialMedias.find((s) => {
		return s.name === 'GitHub';
	});

	return (
		<>
			<Head>
				<title>Vyper OTC</title>
			</Head>
			<Layout>
				<Stack spacing={24} className={styles.container}>
					<div className={styles.hero}>
						<div className={styles.title}>
							Create and trade <span className={styles.glow}>OTC derivatives</span> in less than a minute
						</div>
						<div className={styles.subtitle}>Vyper allows anyone to trade a wide range of on-chain derivatives in a transparent and easy way</div>
						<div className={styles.button_group}>
							<a className={cn(styles.button, styles.first)} href={UrlBuilder.buildCreateContractUrl()}>
								Create
							</a>
							<a className={cn(styles.button, styles.second)} href={UrlBuilder.buildExplorerUrl()}>
								Trade
							</a>
						</div>
					</div>

					<div className={styles.stats_container}>
						<div className={styles.stats_group}>
							<div className={cn(styles.stat, styles.first)}>
								<div className={styles.value}>650+</div>
								<div className={styles.title}>Contract created</div>
							</div>
							<div className={cn(styles.stat, styles.second)}>
								<div className={styles.value}>$250k</div>
								<div className={styles.title}>Notional traded</div>
							</div>
							<div className={cn(styles.stat, styles.third)}>
								<div className={styles.value}>$20k</div>
								<div className={styles.title}>Collateral traded</div>
							</div>
							<div className={cn(styles.stat, styles.fourth)}>
								<div className={styles.value}>30+</div>
								<div className={styles.title}>Assets supported</div>
							</div>
						</div>
					</div>

					<div className={styles.features_group}>
						<div className={cn(styles.feature, styles.first)}>
							<div className={styles.title}>Create</div>
							<div className={styles.text}>Create a new contract in a few clicks and choose from a wide range of choices</div>
							<a className={styles.link} href={UrlBuilder.buildCreateContractUrl()}>
								launch creator
							</a>
						</div>

						<div className={cn(styles.feature, styles.second)}>
							<div className={styles.title}>Trade</div>
							<div className={styles.text}>Deposit some collateral and Vyper takes care of your trade including settlement</div>
							<a className={styles.link} href={UrlBuilder.buildExplorerUrl()}>
								launch explorer
							</a>
						</div>

						<div className={cn(styles.feature, styles.third)}>
							<div className={styles.title}>Join</div>
							<div className={styles.text}>Join our community of traders and ask for a quote on your trade</div>
							<a className={styles.link} href={telegram.link}>
								join chat
							</a>
						</div>

						<div className={cn(styles.feature, styles.fourth)}>
							<div className={styles.title}>DYOR</div>
							<div className={styles.text}>Vyper OTC and Vyper Core are open source in true spirit of DeFi</div>
							<a className={styles.link} href={github.link}>
								check out the repo
							</a>
						</div>
					</div>

					<div className={styles.templates}>
						<div className={styles.title}>Start from a template contract</div>
						<TemplateGrid />
					</div>
				</Stack>
			</Layout>
		</>
	);
};

export default Home;

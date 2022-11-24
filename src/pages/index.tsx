import { Stack } from '@mui/material';
import TemplateGrid from 'components/organisms/TemplateGrid';
import Layout from 'components/templates/Layout';
import Head from 'next/head';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './index.module.scss';

const Home = () => {
	return (
		<>
			<Head>
				<title>Vyper OTC</title>
			</Head>
			<Layout>
				<Stack spacing={12} className={styles.container}>
					<div className={styles.hero}>
						<div className={styles.text_wrapper}>
							<div className={styles.title}>VYPER OTC</div>
							<div className={styles.subtitle}>Permissionless derivatives</div>
						</div>

						<div className={styles.button_wrapper}>
							<a className={styles.button} href={UrlBuilder.buildExplorerUrl()}>
								Explore
							</a>
							<a className={styles.button} href={UrlBuilder.buildCreateContractUrl()}>
								Create
							</a>
						</div>
					</div>

					<div className={styles.template_wrapper}>
						<div className={styles.title}>Create from a template contract</div>
						<div className={styles.grid}>
							<TemplateGrid />
						</div>
					</div>
				</Stack>
			</Layout>
		</>
	);
};

export default Home;

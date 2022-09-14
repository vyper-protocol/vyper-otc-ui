import React from 'react';

import Footer from 'components/layout/Footer/Footer';
import Header from 'components/layout/Header/Header';
import Head from 'next/head';

const Home = () => {
	return (
		<div className="container">
			<Head>
				<title>Vyper OTC</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<Header title="Welcome to the best derivatives platform!" />
			</main>

			<Footer />
		</div>
	);
};

export default Home;

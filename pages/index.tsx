import Head from 'next/head';
import Header from 'components/Header';
import Footer from 'components/Footer';
import React from 'react';

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

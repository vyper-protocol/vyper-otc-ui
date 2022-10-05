import { extractStyles } from 'evergreen-ui';
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document<{css: any, hydrationScript:any}> {
	static async getInitialProps ({ renderPage }) {
		const page = await renderPage();
		const { css, hydrationScript } = extractStyles();

		return {
			...page,
			css,
			hydrationScript
		};
	}

	render () {
		const { css, hydrationScript } = this.props;

		return (
			<Html>
				<Head>
					<style dangerouslySetInnerHTML={{ __html: css }} />
				</Head>

				<body>
					<Main />
					{hydrationScript}
					<NextScript />
				</body>
			</Html>
		);
	}
}
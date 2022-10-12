// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

const sentryWebpackPluginOptions = {
	// Additional config options for the Sentry Webpack plugin. Keep in mind that
	// the following options are set automatically, and overriding them is not
	// recommended:
	//   release, url, org, project, authToken, configFile, stripPrefix,
	//   urlPrefix, include, ignore

	silent: true // Suppresses all logs
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(
	withBundleAnalyzer({
		// Optional build-time configuration options
		sentry: {
			// See the 'Configure Source Maps' and 'Configure Legacy Browser Support'
			// sections below for information on the following options:
			//   - disableServerWebpackPlugin
			//   - disableClientWebpackPlugin
			//   - autoInstrumentServerFunctions
			//   - hideSourceMaps
			//   - widenClientFileUpload
			//   - transpileClientSDK
		}
	}),
	sentryWebpackPluginOptions
);

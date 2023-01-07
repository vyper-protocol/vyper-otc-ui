// react page divided in two flex columns
// left column is a component
// right column is a component

import React from 'react';

import { Box } from '@mui/system';

import styles from './ProPage.module.scss';
import ProTrading from 'components/ProTrading';

const ProPage = () => {
	return (
		<Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
			<Box className={styles.left}>
				<ProTrading />
			</Box>
			<Box className={styles.right}>
				<iframe src="https://birdeye.so/tv-widget/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" width={'100%'} height={'100%'} />
			</Box>
		</Box>
	);
};

export default ProPage;

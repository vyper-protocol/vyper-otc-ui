import { Box } from '@mui/material';

import styles from './Footer.module.scss';

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<Box margin={20}>Vyper OTC application built on Vyper Core | Copyright ©{new Date().getFullYear()}</Box>
		</footer>
	);
};

export default Footer;

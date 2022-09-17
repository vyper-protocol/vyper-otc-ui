import { Pane } from 'evergreen-ui';
import styles from './Footer.module.scss';

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<Pane margin={20}>Vyper OTC application built on Vyper Core | Copyright ©{new Date().getFullYear()}</Pane>
		</footer>
	);
};

export default Footer;

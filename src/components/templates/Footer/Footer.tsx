import cn from 'classnames';
import resources from 'configs/resources.json';
import { FaTelegramPlane } from 'react-icons/fa';

import styles from './Footer.module.scss';

const Footer = () => {
	const telegram = resources.socialMedias.find((s) => {
		return s.name === 'Telegram';
	});

	return (
		<footer className={styles.footer}>
			<a className={cn(styles.hidden, styles.join)} href={telegram.link}>
				<span className={styles.text}>Join NOW</span>
				<FaTelegramPlane className={styles.icon} />
			</a>
			<div className={styles.appBy}>
				Vyper OTC application built on{' '}
				<a target="_blank" rel="noopener noreferrer" href="https://github.com/vyper-protocol/vyper-core">
					Vyper Core
				</a>
			</div>
			<a className={styles.join} href={telegram.link}>
				<span className={styles.text}>Join NOW</span>
				<FaTelegramPlane className={styles.icon} />
			</a>
		</footer>
	);
};

export default Footer;

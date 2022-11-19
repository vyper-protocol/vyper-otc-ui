/* eslint-disable css-modules/no-unused-class */
import SearchIcon from '@mui/icons-material/Search';
import { Fab } from '@mui/material';

import styles from './ExplorerIcon.module.scss';

type ExplorerIconProps = {
	// The explorer link
	link: string;
};

const ExplorerIcon = ({ link }: ExplorerIconProps) => {
	return (
		<Fab className={styles.fab} sx={{ boxShadow: 1, alignItems: 'center' }} color="default" size="small" href={link}>
			<SearchIcon className={styles.icon} />
		</Fab>
	);
};

export default ExplorerIcon;

/* eslint-disable css-modules/no-unused-class */
import { useState } from 'react';

import cn from 'classnames';
import SearchBar from 'components/molecules/SearchBar/SearchBar';
import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import { Text, Pane, Heading, StackedChartIcon, CubeAddIcon, ListDetailViewIcon } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './TopBar.module.scss';

const menuItems = [
	{
		name: 'Home',
		icon: <StackedChartIcon />,
		path: '/',
		wip: false
	},
	{
		name: 'Create Contract',
		icon: <CubeAddIcon />,
		path: '/contract/create_contract',
		wip: true
	},
	{
		name: 'Summary',
		icon: <ListDetailViewIcon />,
		path: '/contract/summary',
		wip: false
	}
];

const TopBar = () => {
	const router = useRouter();

	const [searchValue, setSearchValue] = useState('');

	return (
		<>
			<Pane className={styles.topbar}>
				<Link href="/">
					<Heading size={600}>Vyper OTC</Heading>
				</Link>

				<Pane className={styles.nav}>
					{menuItems.map((menuItem) => {
						return (
							<div
								key={menuItem.name}
								className={cn(
									styles.item,
									menuItem.wip && styles.disabled,
									router.asPath === menuItem.path && styles.active
								)}
							>
								<Link href={menuItem.path} as={menuItem.path}>
									<Text>
										{menuItem.icon} {menuItem.name}
									</Text>
								</Link>
							</div>
						);
					})}
				</Pane>

				<SelectWallet />
			</Pane>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
		</>
	);
};

export default TopBar;

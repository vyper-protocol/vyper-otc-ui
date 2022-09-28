/* eslint-disable css-modules/no-unused-class */
import { useState } from 'react';

import cn from 'classnames';
import SearchBar from 'components/molecules/SearchBar/SearchBar';
import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import { Text, Pane, Heading, StackedChartIcon, CubeAddIcon, Tooltip } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './TopBar.module.scss';
import ClusterSelector from '../ClusterSelector/ClusterSelector';

const menuItems = [
	{
		name: 'Home',
		icon: <StackedChartIcon />,
		path: '/',
		wip: false,
		tooltip: false
	},
	{
		name: 'Create Contract',
		icon: <CubeAddIcon />,
		path: '/contract/create_contract',
		wip: true,
		tooltip: 'Coming soon'
	}
];

const TopBar = () => {
	const router = useRouter();

	const [searchValue, setSearchValue] = useState('');

	const routerArray = router.asPath.split('/');
	const routerCondition = `/${routerArray[1]}/${routerArray[2]}`;

	return (
		<>
			<Pane className={styles.topbar}>
				<Link href="/">
					<Heading size={600} className={styles.hover}>
						Vyper OTC
					</Heading>
				</Link>

				<Pane className={styles.nav}>
					{menuItems.map((menuItem) => {
						const itemPathArray = menuItem.path.split('/');
						const itemPathCondition = `/${itemPathArray[1]}/${itemPathArray[2]}`;

						return (
							<div
								key={menuItem.name}
								className={cn(
									styles.item,
									menuItem.wip && styles.disabled,
									routerCondition === itemPathCondition && styles.active
								)}
							>
								<Link href={menuItem.path} as={menuItem.path}>
									{menuItem.tooltip ? (
										<Tooltip content={menuItem.tooltip}>
											<Text>
												{menuItem.icon} {menuItem.name}
											</Text>
										</Tooltip>
									) : (
										<Text>
											{menuItem.icon} {menuItem.name}
										</Text>
									)}
								</Link>
							</div>
						);
					})}
				</Pane>

				<Pane display="flex" alignItems="center">
					<ClusterSelector className={styles.cluster} />
					<SelectWallet />
				</Pane>
			</Pane>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
		</>
	);
};

export default TopBar;

/* eslint-disable css-modules/no-unused-class */
import { useState } from 'react';

import cn from 'classnames';
import DiscordIcon from 'components/atoms/Icons/Discord';
import TwitterIcon from 'components/atoms/Icons/Twitter';
import SearchBar from 'components/molecules/SearchBar/SearchBar';
import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import {
	Text,
	Pane,
	Heading,
	StackedChartIcon,
	CubeAddIcon,
	GridViewIcon,
	ChevronDownIcon,
	Tooltip,
	Popover,
	Position
} from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './TopBar.module.scss';

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

const socialMediaItems = [
	{
		name: 'Twitter',
		icon: <TwitterIcon />,
		link: 'https://twitter.com/VyperProtocol'
	},
	{
		name: 'Discord',
		icon: <DiscordIcon />,
		link: 'https://discord.com/invite/DuXVSgjmuW'
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

					<Popover
						statelessProps={{
							className: cn(styles.popover)
						}}
						position={Position.BOTTOM}
						content={
							<Pane className={styles.container}>
								{socialMediaItems.map((item) => {
									return (
										<a
											key={item.name}
											className={styles.item}
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											{item.icon}
											<Text>{item.name}</Text>
										</a>
									);
								})}
							</Pane>
						}
					>
						<div className={styles.item}>
							<Text>
								<GridViewIcon /> More <ChevronDownIcon />
							</Text>
						</div>
					</Popover>
				</Pane>

				<SelectWallet />
			</Pane>
			<SearchBar searchState={{ value: searchValue, setValue: setSearchValue }} className={styles.searchbar} />
		</>
	);
};

export default TopBar;

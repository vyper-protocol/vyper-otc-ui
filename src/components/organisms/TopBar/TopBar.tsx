/* eslint-disable css-modules/no-unused-class */
import cn from 'classnames';
import Icon, { AvailableIconNames } from 'components/atoms/Icon';
import SelectWallet from 'components/organisms/SelectWallet';
import resources from 'configs/resources.json';
import { Text, Pane, Heading, StackedChartIcon, CubeAddIcon, GridViewIcon, ChevronDownIcon, Tooltip, Popover, Position } from 'evergreen-ui';
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
	}
];

const TopBar = () => {
	const router = useRouter();

	const routerArray = router.asPath.split('/');
	const routerCondition = `/${routerArray[1]}/${routerArray[2]}`;

	const onCreateContractClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (e.altKey) router.push('/contract/create');
	};

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
							<div key={menuItem.name} className={cn(styles.item, menuItem.wip && styles.disabled, routerCondition === itemPathCondition && styles.active)}>
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

					<div className={cn(styles.item)}>
						<Tooltip content="Coming soon">
							<Text onClick={onCreateContractClick}>
								<CubeAddIcon /> Create contract
							</Text>
						</Tooltip>
					</div>

					<Popover
						statelessProps={{
							className: cn(styles.popover)
						}}
						position={Position.BOTTOM}
						content={
							<Pane className={styles.container}>
								{resources.socialMedias.map((item) => {
									return (
										<a key={item.name} className={styles.item} href={item.link} target="_blank" rel="noopener noreferrer">
											<Icon name={item.icon as AvailableIconNames} />
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
		</>
	);
};

export default TopBar;

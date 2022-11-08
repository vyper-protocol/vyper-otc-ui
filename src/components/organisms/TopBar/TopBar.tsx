/* eslint-disable css-modules/no-unused-class */

import React, { useState, useEffect } from 'react';

import cn from 'classnames';
import Icon, { AvailableIconNames } from 'components/atoms/Icon';
import AirdropButton from 'components/molecules/AirdropButton';
import SelectWallet from 'components/organisms/SelectWallet';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import resources from 'configs/resources.json';
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
	Position,
	PathSearchIcon,
	Badge,
	Menu
} from 'evergreen-ui';
import { GiHamburgerMenu } from 'react-icons/gi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './TopBar.module.scss';

const TopBar = () => {
	const router = useRouter();
	const pathname = router.pathname;
	const cluster = getCurrentCluster();

	const onCreateContractClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (e.altKey) {
			router.push(UrlBuilder.buildCreateContractUrl());
		}
	};

	const [navigation, setNavigation] = useState([
		{ href: ['/', '/contract/summary/[id]'], current: false },
		{ href: ['/contract/create'], current: false },
		{ href: ['/explorer'], current: false }
	]);

	const menuItems = <>
		{/* HOME LINK */}
		<div className={navigation[0].current ? cn(styles.item, styles.active) : cn(styles.item)}>
			<Link href={UrlBuilder.buildHomeUrl()}>
				<a>
					<StackedChartIcon /> Home
				</a>
			</Link>
		</div>

		{/* CREATE CONTRACT LINK */}
		<div className={navigation[1].current ? cn(styles.item, styles.active) : cn(styles.item)}>
			<Tooltip content="Coming soon">
				<a onClick={onCreateContractClick}>
					<CubeAddIcon /> Create contract
				</a>
			</Tooltip>
		</div>

		{/* EXPLORER LINK */}
		<div className={navigation[2].current ? cn(styles.item, styles.active) : cn(styles.item)}>
			<Link href={UrlBuilder.buildExplorerUrl()}>
				<a>
					<PathSearchIcon /> Explorer
				</a>
			</Link>
		</div>

		{/* SOCIALS */}
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

		<div className={cn(styles.item, cluster !== 'devnet' && styles.hidden)}>
			<AirdropButton />
		</div>
	</>;

	useEffect(() => {
		const newNavigation = [...navigation];
		for (let i = 0; i < newNavigation.length; i++) {
			if (newNavigation[i].href.includes(pathname)) newNavigation[i].current = true;
			else newNavigation[i].current = false;
		}
		setNavigation(newNavigation);
		//   eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, setNavigation]);

	return (
		<>
			<Pane className={styles.topbar}>
				<div className={styles.navLeftItems}>
					<Link href={UrlBuilder.buildHomeUrl()}>
						<Heading size={600} className={styles.hover}>
							Vyper OTC
						</Heading>
					</Link>
				</div>

				<Pane className={styles.nav}>
					{ menuItems }

					{cluster !== 'mainnet-beta' && (
						<Badge color="orange" marginRight={100} className={cn(styles.item, styles.mobileonly)}>
							{cluster}
						</Badge>
					)}

					<Popover
						position={Position.BOTTOM_RIGHT}
						statelessProps={{
							className: cn(styles.popover)
						}}
						content={
							<Pane className={cn(styles.container, styles.mobileNav)}>
								{ menuItems }
								<Pane className={styles.item}>
									<SelectWallet />
								</Pane>
							</Pane>
						}
					>
						<Pane className={cn(styles.item, styles.mobileonly)}>
							<GiHamburgerMenu />
						</Pane>
					</Popover>
				</Pane>

				<Pane className={styles.navRightItems} display="flex" alignItems="center">
					{cluster !== 'mainnet-beta' && (
						<Badge color="orange" marginRight={10}>
							{cluster}
						</Badge>
					)}
					<SelectWallet />
				</Pane>
			</Pane>
		</>
	);
};

export default TopBar;

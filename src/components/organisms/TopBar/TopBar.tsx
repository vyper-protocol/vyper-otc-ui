/* eslint-disable css-modules/no-unused-class */

import React, { useState, useEffect } from 'react';

import { Box, Typography, Tooltip, Chip, Popover } from '@mui/material';
import cn from 'classnames';
import Icon, { AvailableIconNames } from 'components/atoms/Icon';
import AirdropButton from 'components/molecules/AirdropButton';
import SelectWallet from 'components/organisms/SelectWallet';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import resources from 'configs/resources.json';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BiChevronDown } from 'react-icons/bi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { HiFolderAdd } from 'react-icons/hi';
import { MdStackedBarChart } from 'react-icons/md';
import { RiLayoutGridFill } from 'react-icons/ri';
import { TbMapSearch } from 'react-icons/tb';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './TopBar.module.scss';

const TopBar = () => {
	const router = useRouter();
	const pathname = router.pathname;
	const cluster = getCurrentCluster();
	const [socialsMenuAnchor, setSocialsMenuAnchor] = useState();
	const [mobileMenuAnchor, setMobileMenuAnchor] = useState();
	const showSocialsMenu = !!socialsMenuAnchor;
	const showMobileMenu = !!mobileMenuAnchor;

	const onCreateContractClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (e.altKey) {
			router.push(UrlBuilder.buildCreateContractUrl());
		}
	};

	const openSocialsMenu = (event) => setSocialsMenuAnchor(event.currentTarget);
	const closeSocialsMenu = () => setSocialsMenuAnchor(undefined);
	const openMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
	const closeMobileMenu = () => setMobileMenuAnchor(undefined);

	const [navigation, setNavigation] = useState([
		{ href: ['/', '/contract/summary/[id]'], current: false },
		{ href: ['/contract/create'], current: false },
		{ href: ['/explorer'], current: false }
	]);

	const menuItems = (
		<>
			{/* HOME LINK */}
			<div className={navigation[0].current ? cn(styles.item, styles.active) : cn(styles.item)}>
				<Link href={UrlBuilder.buildHomeUrl()}>
					<a>
						<MdStackedBarChart size="20px" /> Home
					</a>
				</Link>
			</div>

			{/* CREATE CONTRACT LINK */}
			<div className={navigation[1].current ? cn(styles.item, styles.active) : cn(styles.item)}>
				<Tooltip title="Coming soon">
					<a onClick={onCreateContractClick}>
						<HiFolderAdd size="20px" /> Create contract
					</a>
				</Tooltip>
			</div>

			{/* EXPLORER LINK */}
			<div className={navigation[2].current ? cn(styles.item, styles.active) : cn(styles.item)}>
				<Link href={UrlBuilder.buildExplorerUrl()}>
					<a>
						<TbMapSearch size="20px" /> Explorer
					</a>
				</Link>
			</div>

			{/* SOCIALS */}
			<div className={styles.item} onClick={openSocialsMenu}>
				<Typography className={styles.typography}>
					<RiLayoutGridFill size="20px" /> More <BiChevronDown size="20px" />
				</Typography>
			</div>
			<Popover
				open={showSocialsMenu}
				anchorEl={socialsMenuAnchor}
				anchorOrigin={{
					horizontal: 'left',
					vertical: 'bottom'
				}}
				PaperProps={{
					className: styles.popover
				}}
				onClose={closeSocialsMenu}
			>
				<Box className={styles.container}>
					{resources.socialMedias.map((item) => {
						return (
							<a key={item.name} className={styles.item} href={item.link} target="_blank" rel="noopener noreferrer">
								<Icon name={item.icon as AvailableIconNames} />
								<Typography className={styles.typography}>{item.name}</Typography>
							</a>
						);
					})}
				</Box>
			</Popover>

			<div className={cn(styles.item, cluster !== 'devnet' && styles.hidden)}>
				<AirdropButton />
			</div>
		</>
	);

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
			<Box className={styles.topbar}>
				<div className={styles.navLeftItems}>
					<Link href={UrlBuilder.buildHomeUrl()}>
						<a>
							<Typography component="h2" variant="h6" sx={{ fontWeight: 600, fontSize: '1.15rem' }} className={styles.hover}>
								Vyper OTC
							</Typography>
						</a>
					</Link>
				</div>

				<Box className={styles.nav}>
					{menuItems}

					{cluster !== 'mainnet-beta' && (
						<Chip color="warning" sx={{ marginRight: '10px', textTransform: 'uppercase' }} label={cluster} className={cn(styles.item, styles.mobileonly)} />
					)}

					<Box className={cn(styles.item, styles.mobileonly)} onClick={openMobileMenu}>
						<GiHamburgerMenu />
					</Box>
					<Popover
						open={showMobileMenu}
						anchorEl={mobileMenuAnchor}
						anchorOrigin={{
							horizontal: 'left',
							vertical: 'bottom'
						}}
						PaperProps={{
							className: styles.popover
						}}
						onClose={closeMobileMenu}
					>
						<Box className={cn(styles.container, styles.mobileNav)}>
							{menuItems}
							<Box className={styles.item}>
								<SelectWallet />
							</Box>
						</Box>
					</Popover>
				</Box>

				<Box className={styles.navRightItems} display="flex" alignItems="center">
					{cluster !== 'mainnet-beta' && <Chip color="warning" sx={{ marginRight: '10px', textTransform: 'uppercase' }} label={cluster} />}
					<SelectWallet />
				</Box>
			</Box>
		</>
	);
};

export default TopBar;

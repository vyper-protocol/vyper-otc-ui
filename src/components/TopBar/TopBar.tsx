/* eslint-disable css-modules/no-unused-class */

import React, { useState, useEffect } from 'react';

import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { Box, Typography, Popover } from '@mui/material';
import cn from 'classnames';
import AirdropButton from 'components/AirdropButton';
import Icon, { AvailableIconNames } from 'components/Icon';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import SelectWallet from 'components/SelectWallet';
import StatusBadge from 'components/StatusBadge';
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
	const [featuredMenuAnchor, setFeaturedMenuAnchor] = useState();
	const [mobileMenuAnchor, setMobileMenuAnchor] = useState();
	const showSocialsMenu = !!socialsMenuAnchor;
	const showFeaturedMenu = !!featuredMenuAnchor;
	const showMobileMenu = !!mobileMenuAnchor;

	const openSocialsMenu = (event) => setSocialsMenuAnchor(event.currentTarget);
	const closeSocialsMenu = () => setSocialsMenuAnchor(undefined);

	const openFeaturedMenu = (event) => setFeaturedMenuAnchor(event.currentTarget);
	const closeFeaturedMenu = () => setFeaturedMenuAnchor(undefined);

	const openMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
	const closeMobileMenu = () => setMobileMenuAnchor(undefined);

	const [navigation, setNavigation] = useState([
		{ href: ['/', '/contract/summary/[id]'], current: false },
		{ href: ['/contract/create'], current: false },
		{ href: ['/explorer'], current: false }
	]);

	const featured = [
		{
			id: 'sbf-to-jail',
			name: 'SBF TO JAIL',
			icon: 'GiImprisoned'
		},
		{
			id: 'sol-10x',
			name: 'SOL 10x',
			icon: 'IoIosRocket'
		}
	];

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

			{/* FEATURED */}
			<div className={showFeaturedMenu ? cn(styles.item, styles.active) : cn(styles.item)} onClick={openFeaturedMenu}>
				<EmojiObjectsIcon /> Featured <BiChevronDown size="20px" />
			</div>
			<Popover
				open={showFeaturedMenu}
				anchorEl={featuredMenuAnchor}
				anchorOrigin={{
					horizontal: 'left',
					vertical: 'bottom'
				}}
				PaperProps={{
					className: styles.popover
				}}
				onClose={closeFeaturedMenu}
			>
				<Box className={styles.container}>
					{featured.map((item, i) => {
						return (
							<a key={i} className={styles.item} href={UrlBuilder.buildFeaturedUrl(item.id)}>
								<Icon name={item.icon as AvailableIconNames} />
								<Typography className={styles.typography}>{item.name}</Typography>
							</a>
						);
					})}
				</Box>
			</Popover>

			{/* CREATE CONTRACT LINK */}
			<div className={navigation[1].current ? cn(styles.item, styles.active) : cn(styles.item)}>
				<Link href={UrlBuilder.buildCreateContractUrl()}>
					<a>
						<HiFolderAdd size="20px" /> Create contract
					</a>
				</Link>
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
				<RiLayoutGridFill size="20px" /> More <BiChevronDown size="20px" />
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
							<Typography component="h2" variant="h6" sx={{ fontWeight: 600, fontSize: '1.15rem', fontFamily: 'monospace' }} className={styles.hover}>
								Vyper OTC
							</Typography>
						</a>
					</Link>
				</div>

				<Box className={styles.nav}>
					{menuItems}

					{/* {cluster !== 'mainnet-beta' && (
						// TODO fix mobile only
						<StatusBadge label={cluster} mode="error" />
						// <Chip  sx={{ marginRight: '10px', textTransform: 'uppercase' }} label={cluster} className={cn(styles.item, styles.mobileonly)} />
					)} */}

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
					{cluster !== 'mainnet-beta' && (
						<Box sx={{ mr: 2 }}>
							<StatusBadge label={cluster} mode="warning" />
						</Box>
					)}
					<SelectWallet />
				</Box>
			</Box>
		</>
	);
};

export default TopBar;

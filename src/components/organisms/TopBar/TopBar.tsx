/* eslint-disable css-modules/no-unused-class */

import cn from 'classnames';
import Icon, { AvailableIconNames } from 'components/atoms/Icon';
import AirdropButton from 'components/molecules/AirdropButton';
import SelectWallet from 'components/organisms/SelectWallet';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import resources from 'configs/resources.json';
import { Text, Pane, Heading, StackedChartIcon, CubeAddIcon, GridViewIcon, ChevronDownIcon, Tooltip, Popover, Position } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

import ClusterSelector from '../ClusterSelector/ClusterSelector';
import styles from './TopBar.module.scss';

const TopBar = () => {
	const router = useRouter();

	const urlProvider = useContext(UrlProviderContext);

	const onCreateContractClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (e.altKey) {
			router.push(urlProvider.buildCreateContractUrl());
		}
	};

	return (
		<>
			<Pane className={styles.topbar}>
				<Link href={urlProvider.buildHomeUrl()}>
					<Heading size={600} className={styles.hover}>
						Vyper OTC
					</Heading>
				</Link>

				<Pane className={styles.nav}>
					{/* HOME LINK */}
					<div>
						<Link href={urlProvider.buildHomeUrl()}>
							<Text>
								<StackedChartIcon /> Home
							</Text>
						</Link>
					</div>

					{/* CREATE CONTRACT LINK */}
					<div className={cn(styles.item)}>
						<Tooltip content="Coming soon">
							<Text onClick={onCreateContractClick}>
								<CubeAddIcon /> Create contract
							</Text>
						</Tooltip>
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

					<div className={styles.item}>
						<AirdropButton />
					</div>
				</Pane>

				<Pane display="flex" alignItems="center">
					<ClusterSelector className={styles.cluster} />
					<SelectWallet />
				</Pane>
			</Pane>
		</>
	);
};

export default TopBar;

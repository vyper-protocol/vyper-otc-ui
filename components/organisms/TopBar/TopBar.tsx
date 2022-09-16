import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import { Pane, Heading } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
	{
		name: 'Summary (test)',
		path: '/contract/summary/5ktgP8XxbcgoZC2a54TiPy7JKpEgyY1GMCWy1u95ZrPc'
	}
];

const TopBar = () => {
	return (
		<Pane display="flex" padding={16} background="lightgray">
			<Pane flex={1} alignItems="center" display="flex">
				<Link href="/">
					<Heading size={600}>Vyper OTC</Heading>
				</Link>

				<Pane marginLeft={30}>
					{menuItems.map((menuItem) => {
						return (
							<div key={menuItem.name}>
								<Link href={menuItem.path} as={menuItem.path}>
									{menuItem.name}
								</Link>
							</div>
						);
					})}
				</Pane>
			</Pane>
			<Pane>
				<SelectWallet />
			</Pane>
		</Pane>
	);
};

export default TopBar;

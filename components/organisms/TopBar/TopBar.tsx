import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import { Pane, Heading, Button } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
	{
		name: 'Summary (test)',
		path: 'contract/summary/WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3'
	}
];

const TopBar = () => {
	const router = useRouter();

	return (
		<Pane display="flex" padding={16} background="lightgray">
			<Pane flex={1} alignItems="center" display="flex">
				<Link href="/">
					<Heading size={600}>Vyper OTC</Heading>
				</Link>

				<Pane marginLeft={30}>
					{menuItems.map((menuItem) => {
						return (
							<Link key={menuItem.name} href={menuItem.path} as={menuItem.path} replace>
								<Button>{menuItem.name}</Button>
							</Link>
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

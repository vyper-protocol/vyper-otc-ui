import SelectWallet from 'components/organisms/SelectWallet/SelectWallet';
import { Pane, Heading } from 'evergreen-ui';

const TopBar = () => {
	return (
		<Pane display="flex" padding={16} background="#141e27">
			<Pane flex={1} alignItems="center" display="flex">
				<Heading size={800} color="white">
					Vyper OTC
				</Heading>
			</Pane>
			<Pane>
				<SelectWallet />
			</Pane>
		</Pane>
	);
};

export default TopBar;

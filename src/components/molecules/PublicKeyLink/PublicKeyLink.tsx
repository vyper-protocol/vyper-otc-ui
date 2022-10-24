import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { abbreviateAddress } from 'utils/stringHelpers';

type PublicKeyLinkInput = {
	address: string;
};

const PublicKeyLink = ({ address }: PublicKeyLinkInput) => {
	return (
		<a href={getExplorerLink(address, { cluster: getCurrentCluster() })} target="_blank" rel="noreferrer">
			{abbreviateAddress(address)}
		</a>
	);
};

export default PublicKeyLink;

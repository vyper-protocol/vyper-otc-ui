/* eslint-disable quotes */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import ClickableIcon from 'components/ClickableIcon';
import Modal from 'components/Modal';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { AliasTypeIds, ContractStatusIds } from 'models/common';
import { getAliasLabel } from 'utils/aliasHelper';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import { tweetIntent } from 'utils/socialHelper';
import { abbreviateAddress } from 'utils/stringHelpers';
import { buildContractSummaryUrl, buildFullUrl } from 'utils/urlBuilder';

type ShareModalProps = {
	// alias of the contract
	aliasId: AliasTypeIds;

	// contract status
	statusId: ContractStatusIds;

	// contract address
	contractAddress: string;

	// rate address
	rateAddress: string;

	// open state of the modal
	open: boolean;

	// handle close of the modal
	handleClose: () => void;
};

const getActionFromStatus = (s: ContractStatusIds) => {
	switch (s) {
		case 'unfunded':
			return "I'm looking to trade a";
		case 'wtb':
			return "I'm looking for sellers for a";
		case 'wts':
			return "I'm looking for buyers for a";
		case 'live':
		case 'expired':
		case 'settled':
			return 'Check this out: a';
		default:
			return '';
	}
};

const ShareModal = ({ aliasId, statusId, contractAddress, rateAddress, open, handleClose }: ShareModalProps) => {
	const fullUrl = buildFullUrl(getCurrentCluster(), buildContractSummaryUrl(contractAddress));

	const shareText = `${getActionFromStatus(statusId)} ${getAliasLabel(aliasId).toUpperCase()} on ${
		getOracleByPubkey(rateAddress)?.title ?? abbreviateAddress(rateAddress)
	} using Vyper Protocol 🐍`;

	const ShareMessage = (
		<Box sx={{ p: 1 }}>
			<Typography align="center" variant="h6">
				{shareText} [LINK]
			</Typography>
		</Box>
	);

	const actionProps = (
		<>
			<ClickableIcon onClick={async () => await navigator.clipboard.writeText(shareText + `\n${fullUrl}`)} label={'Copy to clipboard'} clickedLabel={'Copied'}>
				<ContentCopyIcon fontSize="small" sx={{ mx: 0.5 }} />
			</ClickableIcon>

			<ClickableIcon
				onClick={() => window.open(tweetIntent(shareText, fullUrl, 'VyperProtocol', 'VyperOTC'), '_blank')}
				label={'Share on Twitter'}
				clickedLabel={'Sharing'}
			>
				<TwitterIcon fontSize="small" sx={{ mx: 0.5 }} />
			</ClickableIcon>
		</>
	);

	return (
		<div>
			<Modal title={'Share Contract'} open={open} handleClose={handleClose} contentProps={ShareMessage} actionProps={actionProps} />
		</div>
	);
};

export default ShareModal;

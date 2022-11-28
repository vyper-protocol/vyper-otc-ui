import { useRef, useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TwitterIcon from '@mui/icons-material/Twitter';
import ClickableIcon from 'components/atoms/ClickableIcon';
import Modal from 'components/atoms/Modal';
import { toBlob } from 'html-to-image';
import { ChainOtcState } from 'models/ChainOtcState';
import { getTwitterUrl } from 'utils/twitterShareBuilder';

import ShareImg from '../ShareImg';

type ShareModalProps = {
	otcState: ChainOtcState;

	livePricesValue?: number[];

	pov: 'long' | 'short';

	// open state of the modal
	open: boolean;

	// handle close of the modal
	handleClose: () => void;
};

const ShareModal = ({ otcState, livePricesValue, pov, open, handleClose }: ShareModalProps) => {
	const buildTweet = () => {
		const text = `I'm ${pov.toUpperCase()} ${otcState.rateAccount.state.title} on @VyperProtocol\n\nCheck it out: [PASTE IMAGE HERE]`;
		return getTwitterUrl(text, window.location.href);
	};

	const shareMod = useRef(null);

	const [blob, setBlob] = useState<Blob>();

	const onLoad = () => {
		toBlob(shareMod.current, { cacheBust: true }).then((b) => setBlob(b));
	};

	const copyOnClick = async () => {
		await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
	};

	const shareOnClick = async () => {
		await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
		window.open(buildTweet());
	};

	return (
		<Modal
			title={'Share your trade'}
			open={open}
			handleClose={handleClose}
			contentProps={
				// eslint-disable-next-line react/no-unknown-property
				<div ref={shareMod} onLoad={onLoad}>
					<ShareImg otcState={otcState} livePricesValue={livePricesValue} pov={pov} />
				</div>
			}
			actionProps={
				<div>
					<ClickableIcon onClick={copyOnClick} label={'Copy to clipboard'} clickedLabel={'Copied'}>
						<ContentCopyIcon fontSize="small" />
					</ClickableIcon>

					<ClickableIcon onClick={shareOnClick} label={'Share on Twitter'} clickedLabel={'Sharing..'}>
						<TwitterIcon fontSize="small" />
					</ClickableIcon>
				</div>
			}
		/>
	);
};

export default ShareModal;

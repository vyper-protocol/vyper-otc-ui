import { useState, useRef, useCallback } from 'react';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link } from '@mui/material';
import { toBlob } from 'html-to-image';
import TwitterIcon from '@mui/icons-material/Twitter';
import ShareIcon from '@mui/icons-material/Share';
import SocialImg from '../SocialImg';

import styles from './ShareModal.module.scss';

type ShareModalProps = {};

const ShareModal = () => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const shareMod = useRef(null);

	const onButtonClick = useCallback(() => {
		if (shareMod.current === null) {
			return;
		}

		toBlob(shareMod.current, { cacheBust: true }).then((blob) => {
			navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
		});
	}, [shareMod]);

	return (
		<div className={styles.cards}>
			<span className={styles.share} onClick={handleOpen}>
				Share
				<ShareIcon onClick={handleOpen} />
				<Dialog
					open={open}
					onClose={handleClose}
					PaperProps={{
						style: { borderRadius: 16 }
					}}
				>
					{' '}
					<div>
						<DialogTitle>Contract Summary</DialogTitle>
					</div>
					<DialogContent>
						<div ref={shareMod}>
							<SocialImg />
						</div>
					</DialogContent>
					<DialogActions sx={{ px: 4, mb: 2, mt: -2 }}>
						<Button onClick={handleClose}>Cancel</Button>
						<Button onClick={onButtonClick}>Copied</Button>
						<Link href={`https://twitter.com/intent/tweet?text=I'm LONG perp on %40VyperProtocool%0A[PASTE IMAGE HERE]`} target="_blank">
							<TwitterIcon color="primary" />
						</Link>
					</DialogActions>
				</Dialog>
			</span>
		</div>
	);
};

export default ShareModal;

import { Button, Dialog } from '@mui/material';

import styles from './Modal.module.scss';

type ModalProps = {
	// title of the modal
	title: string;

	// open state of the modal
	open: boolean;

	// handle close of the modal
	handleClose: () => void;

	// content of the modal
	contentProps: JSX.Element;

	// actions of the modal
	actionProps?: JSX.Element;
};

const Modal = ({ title, open, handleClose, contentProps, actionProps }: ModalProps) => {
	return (
		<Dialog
			className={styles.dialog}
			open={open}
			onClose={handleClose}
			PaperProps={{
				style: { borderRadius: 16 }
			}}
		>
			<div className={styles.title}>{title}</div>
			<div className={styles.content}>{contentProps}</div>

			<div className={styles.actions}>
				<Button onClick={handleClose}>Cancel</Button>
				{actionProps}
			</div>
		</Dialog>
	);
};

export default Modal;

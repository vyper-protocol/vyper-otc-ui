/**
 * Display the short form of a wallet's address (dG4fs5...hF3jd02)
 */
export const abbreviateAddress = (address: string, size: number = 4) => {
	return address?.slice(0, size) + '…' + address?.slice(-size);
};

/**
 * Copy content to clipboard
 */
export const copyToClipboard = (content: string) => {
	if (!navigator.clipboard) {
		return;
	}
	return navigator.clipboard.writeText(content);
};

/**
 * Display the short form of a string (H8gFJF3...)
 */
export const shortenString = (val: string): string => {
	if (!val) return '...';
	return `${val.slice(0, 8)}...`;
};

/**
 * Display the short form of a wallet's address (dG4fs5...hF3jd02)
 */
export const abbreviateAddress = (address: string, size: number = 4): string => {
	return address?.slice(0, size) + '…' + address?.slice(-size);
};

export const copyToClipboard = (content: string): Promise<void> => {
	if (!navigator.clipboard) {
		return;
	}
	return navigator.clipboard.writeText(content);
};

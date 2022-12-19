export const tweetIntent = (text: string, url?: string, via?: string, hashtag?: string): string => {
	const baseUrl = new URL('https://twitter.com/intent/tweet?');
	const params = new URLSearchParams({ text, ...(url && { url }), ...(via && { via }), ...(hashtag && { hashtags: hashtag }) });
	baseUrl.search = params.toString();
	return baseUrl.toString();
};

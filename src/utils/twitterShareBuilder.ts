export function getTwitterUrl(text: string, url?: string, via?: string, hashtag?: string) {
	const intentUrl = new URL('https://twitter.com/intent/tweet');
	intentUrl.searchParams.append('text', text);

	if (url) {
		intentUrl.searchParams.append('url', url);
	}

	if (via) {
		intentUrl.searchParams.append('via', via);
	}

	if (hashtag) {
		intentUrl.searchParams.append('hashtags', hashtag);
	}

	return intentUrl;
}

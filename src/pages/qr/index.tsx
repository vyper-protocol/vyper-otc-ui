import { useEffect, useMemo, useRef, useState } from 'react';

import { createQROptions, encodeURL, TransactionRequestURLFields } from '@solana/pay';
import QRCodeStyling from '@solana/qr-code-styling';
import Layout from 'components/templates/Layout';
import { useRouter } from 'next/router';

const QRPage = () => {
	const router = useRouter();
	const qp = router.query;
	const [url, setUrl] = useState<URL>();

	useEffect(() => {
		const u = new URL('/api/qr', window.location.origin);

		Object.keys(qp).forEach((k) => {
			u.searchParams.append(k, qp[k].toString());
		});
		setUrl(u);
	}, [qp]);

	const options = useMemo(
		() =>
			createQROptions(
				encodeURL({
					link: url ?? '',
					label: 'hello world label',
					message: 'hello world message'
				} as TransactionRequestURLFields),
				400,
				'transparent',
				'#2a2a2a'
			),
		[url]
	);

	const qr = useMemo(() => new QRCodeStyling(), []);
	useEffect(() => qr.update(options), [qr, options]);

	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (ref.current) {
			qr.append(ref.current);
		}
	}, [ref, qr]);

	return (
		<Layout>
			<>
				{url?.toString()}
				<div ref={ref} />
			</>
		</Layout>
	);
};

export default QRPage;

import { useRouter } from 'next/router';
import { Button, Pane, Text, majorScale } from 'evergreen-ui';

export default function SummaryPage() {
	const router = useRouter();
	const { id } = router.query;

	return (
		<Pane display="flex" alignItems="center" marginX={majorScale(2)}>
			<Text>
				using public key: <code>{id}</code>
			</Text>
			<Button>Click me!</Button>
		</Pane>
	);
}

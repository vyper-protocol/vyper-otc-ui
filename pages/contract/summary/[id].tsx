import { useRouter } from 'next/router';
import { Button, Pane, Text, majorScale, Table } from 'evergreen-ui';
import { getFetchOTCStateQuery } from 'queries/generator';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@project-serum/anchor';

// test account: WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

export default function SummaryPage() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();
	const provider = new AnchorProvider(connection, wallet, {});

	const rateStateQuery = getFetchOTCStateQuery(provider, id as string);

	return (
		<Pane clearfix margin={24}>
			<Pane justifyContent="center" alignItems="center" flexDirection="column" marginBottom={24}>
				<Text>
					using public key: <code>{id}</code>
				</Text>
			</Pane>
			<Pane justifyContent="center" alignItems="center" flexDirection="column">
				{!rateStateQuery.data && <Text>Fetching</Text>}
				{rateStateQuery.data && (
					<Table>
						<Table.Body>
							{Object.keys(rateStateQuery.data).map((k) => (
								<Table.Row key={k}>
									<Table.TextCell>{k}</Table.TextCell>
									<Table.TextCell>{rateStateQuery.data[k]?.toString()}</Table.TextCell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)}
			</Pane>
		</Pane>
	);
}

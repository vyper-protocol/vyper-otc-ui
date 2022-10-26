/* eslint-disable camelcase */
/* eslint-disable indent */
import { AnchorProvider, Program, utils } from '@project-serum/anchor';
import { createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getClusterEndpoint, getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { RatePyth, IDL as RatePythIDL } from 'idls/rate_pyth';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { NextApiRequest, NextApiResponse } from 'next';
import { accountExists } from 'utils/solanaHelper';
import { abbreviateAddress } from 'utils/stringHelpers';

import PROGRAMS from '../../../configs/programs.json';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	// We set up our handler to only respond to `GET` and `POST` requests.
	if (request.method === 'GET') return get(request, response);
	if (request.method === 'POST') return post(request, response);

	throw new Error(`Unexpected method ${request.method}`);
}

const get = async (request: NextApiRequest, response: NextApiResponse) => {
	let label = 'Vyper OTC';
	const icon = 'https://github.com/vyper-protocol/branding/raw/main/medium-logo.png';

	switch (request.query?.op) {
		case 'airdrop':
			label = 'Vyper OTC - airdrop tokens';
			break;
		case 'deposit':
			if (request.query?.isBuyer === 'true') {
				label = 'Vyper OTC - long contract ' + abbreviateAddress(request.query?.contract.toString());
			} else {
				label = 'Vyper OTC - short contract ' + abbreviateAddress(request.query?.contract.toString());
			}
			break;
		default: {
			throw new Error('op not supported ' + request.query?.op);
		}
	}

	response.status(200).send({
		label,
		icon
	});
};

const post = async (request, response) => {
	switch (request.query?.op) {
		case 'airdrop':
			postAirdrop(request, response);
			break;
		case 'deposit':
			postDeposit(request, response);
			break;
		default: {
			throw new Error('op not supported ' + request.query?.op);
		}
	}
};

const postDeposit = async (request, response) => {
	const connection = new Connection(getClusterEndpoint(getCurrentCluster()), {});

	// Account provided in the transaction request body by the wallet.
	const accountField = request.body?.account;
	if (!accountField) throw new Error('missing account');
	const sender = new PublicKey(accountField);

	const otcState = new PublicKey(request.query?.contract);
	const isSeniorSide = request.query?.isBuyer === 'true';

	const provider = new AnchorProvider(connection, undefined, {});

	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), provider);

	const [otcAuthority] = await PublicKey.findProgramAddress([otcState.toBuffer(), utils.bytes.utf8.encode('authority')], vyperOtcProgram.programId);

	const otcStateAccountInfo = await vyperOtcProgram.account.otcState.fetch(otcState);
	const vyperCoreAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(otcStateAccountInfo.vyperTrancheConfig);

	const atokenAccount = await getAssociatedTokenAddress(new PublicKey(vyperCoreAccountInfo.reserveMint), sender);

	const vc_ix = await vyperCoreProgram.methods
		.refreshTrancheFairValue()
		.accounts({
			trancheConfig: otcStateAccountInfo.vyperTrancheConfig,
			seniorTrancheMint: vyperCoreAccountInfo.seniorTrancheMint,
			juniorTrancheMint: vyperCoreAccountInfo.juniorTrancheMint,
			rateProgramState: vyperCoreAccountInfo.rateProgramState,
			redeemLogicProgram: vyperCoreAccountInfo.redeemLogicProgram,
			redeemLogicProgramState: vyperCoreAccountInfo.redeemLogicProgramState,
			signer: sender
		})
		.instruction();

	let plugin_ix: TransactionInstruction = undefined;
	if (vyperCoreAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID))) {
		const rateSwitchboardProgram = new Program<RateSwitchboard>(RateSwitchboardIDL, vyperCoreAccountInfo.rateProgram, provider);
		const rateSwitchboardAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(vyperCoreAccountInfo.rateProgramState);
		plugin_ix = await rateSwitchboardProgram.methods
			.refresh()
			.accounts({
				rateData: vyperCoreAccountInfo.rateProgramState,
				signer: sender
			})
			.remainingAccounts(
				(rateSwitchboardAccountInfo.switchboardAggregators as (null | PublicKey)[])
					.filter((c) => {
						return c !== null;
					})
					.map((c) => {
						return { pubkey: c, isSigner: false, isWritable: false };
					})
			)
			.instruction();
	}

	if (vyperCoreAccountInfo.rateProgram.equals(new PublicKey(PROGRAMS.RATE_PYTH_PROGRAM_ID))) {
		const ratePythProgram = new Program<RatePyth>(RatePythIDL, vyperCoreAccountInfo.rateProgram, provider);
		const ratePythAccountInfo = await ratePythProgram.account.rateState.fetch(vyperCoreAccountInfo.rateProgramState);
		plugin_ix = await ratePythProgram.methods
			.refresh()
			.accounts({
				rateData: vyperCoreAccountInfo.rateProgramState,
				signer: sender
			})
			.remainingAccounts(
				(ratePythAccountInfo.pythOracles as (null | PublicKey)[])
					.filter((c) => {
						return c !== null;
					})
					.map((c) => {
						return { pubkey: c, isSigner: false, isWritable: false };
					})
			)
			.instruction();
	}

	const tx = new Transaction();
	tx.recentBlockhash = (await connection.getLatestBlockhash('single')).blockhash;
	tx.feePayer = sender;

	tx.add(plugin_ix);
	tx.add(vc_ix);
	tx.add(
		await vyperOtcProgram.methods
			.deposit({
				isSeniorSide
			})
			.accounts({
				userReserveTokenAccount: atokenAccount,
				beneficiaryTokenAccount: atokenAccount,
				otcState,
				otcAuthority,
				otcSeniorReserveTokenAccount: otcStateAccountInfo.otcSeniorReserveTokenAccount,
				otcJuniorReserveTokenAccount: otcStateAccountInfo.otcJuniorReserveTokenAccount,
				otcSeniorTrancheTokenAccount: otcStateAccountInfo.otcSeniorTrancheTokenAccount,
				otcJuniorTrancheTokenAccount: otcStateAccountInfo.otcJuniorTrancheTokenAccount,

				reserveMint: vyperCoreAccountInfo.reserveMint,
				seniorTrancheMint: vyperCoreAccountInfo.seniorTrancheMint,
				juniorTrancheMint: vyperCoreAccountInfo.juniorTrancheMint,

				vyperTrancheConfig: otcStateAccountInfo.vyperTrancheConfig,
				vyperTrancheAuthority: vyperCoreAccountInfo.trancheAuthority,
				vyperReserve: vyperCoreAccountInfo.reserve,
				vyperCore: vyperCoreProgram.programId,
				signer: sender
			})
			.instruction()
	);

	// Serialize and return the unsigned transaction.
	const serializedTransaction = tx.serialize({
		verifySignatures: false,
		requireAllSignatures: false
	});

	const base64Transaction = serializedTransaction.toString('base64');
	const message = 'Thank you for depositing on Vyper OTC';

	response.status(200).send({ transaction: base64Transaction, message });
};

const postAirdrop = async (request, response) => {
	const connection = new Connection(getClusterEndpoint(getCurrentCluster()), {});

	// Account provided in the transaction request body by the wallet.
	const accountField = request.body?.account;
	if (!accountField) throw new Error('missing account');
	const sender = new PublicKey(accountField);

	const parsedTokenAmount = parseInt(request.query?.amount ?? '1000');

	const authorityKP = [
		97, 173, 71, 224, 183, 153, 116, 246, 214, 228, 103, 35, 150, 201, 47, 94, 189, 188, 146, 154, 122, 185, 236, 234, 116, 56, 97, 161, 117, 170, 218, 71, 8,
		23, 208, 253, 42, 86, 175, 160, 169, 41, 79, 58, 62, 182, 52, 28, 17, 230, 248, 89, 141, 182, 93, 198, 192, 164, 68, 171, 156, 88, 150, 28
	];
	const mintAddress = new PublicKey('7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W');
	const mintInfo = await getMint(connection, mintAddress);
	const airdropAmount = parsedTokenAmount * 10 ** mintInfo.decimals;

	const tx = new Transaction();
	tx.recentBlockhash = (await connection.getLatestBlockhash('single')).blockhash;
	tx.feePayer = sender;

	const atokenAccount = await getAssociatedTokenAddress(new PublicKey(mintAddress), sender);
	const exists = await accountExists(connection, atokenAccount);
	if (!exists) {
		tx.add(createAssociatedTokenAccountInstruction(sender, atokenAccount, sender, mintAddress));
	}

	const mintAuthority = Keypair.fromSecretKey(new Uint8Array(authorityKP));
	tx.add(createMintToInstruction(new PublicKey(mintAddress), atokenAccount, mintAuthority.publicKey, airdropAmount));
	tx.partialSign(mintAuthority);

	// Serialize and return the unsigned transaction.
	const serializedTransaction = tx.serialize({
		verifySignatures: false,
		requireAllSignatures: false
	});

	const base64Transaction = serializedTransaction.toString('base64');
	const message = 'Thank you for using Vyper OTC';

	response.status(200).send({ transaction: base64Transaction, message });
};

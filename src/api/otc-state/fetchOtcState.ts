/* eslint-disable no-console */
import { AnchorProvider, Program } from '@project-serum/anchor';
import { getAccount, getMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { RedeemLogicForward, IDL as RedeemLogicForwardIDL } from 'idls/redeem_logic_forward';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import RateSwitchboardState from 'models/plugins/RateSwitchboardState';
import { RedeemLogicForwardState } from 'models/plugins/RedeemLogicForwardState';

import PROGRAMS from '../../configs/programs.json';
import { ChainOtcState } from '../../models/ChainOtcState';
import { fetchTokenInfo } from '../tokens/fetchTokenInfo';

const [DUMMY_TOKEN_MINT, USDC_MINT] = ['7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'];

export const fetchOtcState = async (connection: Connection, otcStateAddress: PublicKey): Promise<ChainOtcState> => {
	const promises: Promise<void>[] = [];

	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);

	const res = new ChainOtcState();
	res.publickey = otcStateAddress;

	res.vyperCoreTrancheConfig = accountInfo.vyperTrancheConfig;
	res.reserveMint = trancheConfigAccountInfo.reserveMint;
	res.reserveMintInfo = await getMint(connection, trancheConfigAccountInfo.reserveMint);

	if (trancheConfigAccountInfo.reserveMint.toBase58() === DUMMY_TOKEN_MINT) {
		res.reserveTokenInfo = await fetchTokenInfo(connection, new PublicKey(USDC_MINT));
	} else {
		res.reserveTokenInfo = await fetchTokenInfo(connection, trancheConfigAccountInfo.reserveMint);
	}

	res.createdAt = accountInfo.created.toNumber() * 1000;
	res.depositAvailableFrom = accountInfo.depositStart.toNumber() * 1000;
	res.depositExpirationAt = accountInfo.depositEnd.toNumber() * 1000;
	res.settleAvailableFromAt = accountInfo.settleStart.toNumber() * 1000;
	res.settleExecuted = accountInfo.settleExecuted;

	if (res.settleExecuted) {
		// @ts-ignore
		res.priceAtSettlement = new RustDecimalWrapper(new Uint8Array(trancheConfigAccountInfo.trancheData.reserveFairValue.value[0])).toNumber();
	}

	res.buyerDepositAmount = accountInfo.seniorDepositAmount.toNumber() / 10 ** res.reserveMintInfo.decimals;
	res.sellerDepositAmount = accountInfo.juniorDepositAmount.toNumber() / 10 ** res.reserveMintInfo.decimals;

	promises.push(
		getAccount(connection, accountInfo.otcSeniorReserveTokenAccount).then((c) => {
			res.programBuyerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);
	promises.push(
		getAccount(connection, accountInfo.otcJuniorReserveTokenAccount).then((c) => {
			res.programSellerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);

	res.buyerTA = accountInfo.seniorSideBeneficiary;
	if (res.buyerTA) {
		promises.push(
			getAccount(connection, accountInfo.seniorSideBeneficiary).then((c) => {
				res.buyerWallet = c.owner;
			})
		);
	}

	res.sellerTA = accountInfo.juniorSideBeneficiary;
	if (res.sellerTA) {
		promises.push(
			getAccount(connection, accountInfo.juniorSideBeneficiary).then((c) => {
				res.sellerWallet = c.owner;
			})
		);
	}

	// Rate plugin
	promises.push(
		new Promise(async (resolve) => {
			try {
				const rateSwitchboardProgram = new Program<RateSwitchboard>(
					RateSwitchboardIDL,
					new PublicKey(trancheConfigAccountInfo.rateProgram),
					new AnchorProvider(connection, undefined, {})
				);
				const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(trancheConfigAccountInfo.rateProgramState);
				const rateState = new RateSwitchboardState(
					trancheConfigAccountInfo.rateProgram,
					trancheConfigAccountInfo.rateProgramState,
					rateStateAccountInfo.switchboardAggregators[0]
				);
				await rateState.loadAggregatorData(new AnchorProvider(connection, undefined, {}));
				res.rateState = rateState;
			} catch (err) {
				console.error(err);
			} finally {
				resolve();
			}
		})
	);

	// Redeem logic plugin
	promises.push(
		new Promise(async (resolve) => {
			try {
				const redeemLogicForwardProgram = new Program<RedeemLogicForward>(
					RedeemLogicForwardIDL,
					PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID,
					new AnchorProvider(connection, undefined, {})
				);
				const redeemLogicAccountInfo = await redeemLogicForwardProgram.account.redeemLogicConfig.fetch(trancheConfigAccountInfo.redeemLogicProgramState);

				const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
				const isLinear = redeemLogicAccountInfo.isLinear;
				const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.reserveMintInfo.decimals;
				const redeemLogicState = new RedeemLogicForwardState(
					trancheConfigAccountInfo.redeemLogicProgram,
					trancheConfigAccountInfo.redeemLogicProgramState,
					strike,
					isLinear,
					notional
				);
				res.redeemLogicState = redeemLogicState;
			} catch (err) {
				console.error(err);
			} finally {
				resolve();
			}
		})
	);

	await Promise.all(promises);

	return res;
};

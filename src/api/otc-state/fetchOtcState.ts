/* eslint-disable no-console */
import { AnchorProvider, Program } from '@project-serum/anchor';
import { getAccount, getMint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { RedeemLogicForward, IDL as RedeemLogicForwardIDL } from 'idls/redeem_logic_forward';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import RateSwitchboardState from 'models/RateSwitchboardState';
import { RedeemLogicForwardState } from 'models/RedeemLogicForwardState';

import PROGRAMS from '../../configs/programs.json';
import { OtcState } from '../../models/OtcState';

export const fetchOtcState = async (provider: AnchorProvider, otcStateAddress: PublicKey): Promise<OtcState> => {
	const promises: Promise<void>[] = [];

	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(VyperCoreIDL, new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID), provider);

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);

	const res = new OtcState();
	res.publickey = otcStateAddress;
	res.reserveMintInfo = await getMint(provider.connection, trancheConfigAccountInfo.reserveMint);
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
		getAccount(provider.connection, accountInfo.otcSeniorReserveTokenAccount).then((c) => {
			res.programBuyerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);
	promises.push(
		getAccount(provider.connection, accountInfo.otcJuniorReserveTokenAccount).then((c) => {
			res.programSellerTAAmount = Number(c.amount) / 10 ** res.reserveMintInfo.decimals;
		})
	);

	res.buyerTA = accountInfo.seniorSideBeneficiary;
	if (res.buyerTA) {
		promises.push(
			getAccount(provider.connection, accountInfo.seniorSideBeneficiary).then((c) => {
				res.buyerWallet = c.owner;
			})
		);
	}

	res.sellerTA = accountInfo.juniorSideBeneficiary;
	if (res.sellerTA) {
		promises.push(
			getAccount(provider.connection, accountInfo.juniorSideBeneficiary).then((c) => {
				res.sellerWallet = c.owner;
			})
		);
	}

	// Rate plugin
	promises.push(
		new Promise(async (resolve) => {
			try {
				const rateSwitchboardProgram = new Program<RateSwitchboard>(RateSwitchboardIDL, new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID), provider);
				const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(trancheConfigAccountInfo.rateProgramState);
				const rateState = new RateSwitchboardState(rateStateAccountInfo.switchboardAggregators[0]);
				await rateState.loadAggregatorData(provider);
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
				const redeemLogicForwardProgram = new Program<RedeemLogicForward>(RedeemLogicForwardIDL, PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID, provider);
				const redeemLogicAccountInfo = await redeemLogicForwardProgram.account.redeemLogicConfig.fetch(trancheConfigAccountInfo.redeemLogicProgramState);

				const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
				const isLinear = redeemLogicAccountInfo.isLinear;
				const notional = redeemLogicAccountInfo.notional.toNumber() / 10 ** res.reserveMintInfo.decimals;
				const redeemLogicState = new RedeemLogicForwardState(strike, isLinear, notional);
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

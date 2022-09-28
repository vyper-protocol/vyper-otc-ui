/* eslint-disable no-console */
import { AnchorProvider, Program } from '@project-serum/anchor';
import { getAccount } from '@solana/spl-token';
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
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(
		VyperCoreIDL,
		new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID),
		provider
	);

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);

	const res = new OtcState();
	res.publickey = otcStateAddress;
	res.createdAt = accountInfo.created.toNumber() * 1000;
	res.depositAvailableFrom = accountInfo.depositStart.toNumber() * 1000;
	res.depositExpirationAt = accountInfo.depositEnd.toNumber() * 1000;
	res.settleAvailableFromAt = accountInfo.settleStart.toNumber() * 1000;
	res.settleExecuted = accountInfo.settleExecuted;
	res.buyerDepositAmount = accountInfo.seniorDepositAmount.toNumber();
	res.sellerDepositAmount = accountInfo.juniorDepositAmount.toNumber();

	res.programBuyerTAAmount = Number(
		(await getAccount(provider.connection, accountInfo.otcSeniorReserveTokenAccount)).amount
	);
	res.programSellerTAAmount = Number(
		(await getAccount(provider.connection, accountInfo.otcJuniorReserveTokenAccount)).amount
	);

	res.buyerTA = accountInfo.seniorSideBeneficiary;
	if (res.buyerTA) {
		res.buyerWallet = (await getAccount(provider.connection, accountInfo.seniorSideBeneficiary)).owner;
	}

	res.sellerTA = accountInfo.juniorSideBeneficiary;
	if (res.sellerTA) {
		res.sellerWallet = (await getAccount(provider.connection, accountInfo.juniorSideBeneficiary)).owner;
	}

	// Rate plugin

	try {
		const rateSwitchboardProgram = new Program<RateSwitchboard>(
			RateSwitchboardIDL,
			new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID),
			provider
		);
		const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(
			trancheConfigAccountInfo.rateProgramState
		);
		res.rateState = new RateSwitchboardState(rateStateAccountInfo.switchboardAggregators[0]);
		await res.rateState.loadAggregatorData(provider);
	} catch (err) {
		console.error(err);
	}

	// Redeem logic plugin

	try {
		const redeemLogicForwardProgram = new Program<RedeemLogicForward>(
			RedeemLogicForwardIDL,
			PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID,
			provider
		);
		const redeemLogicAccountInfo = await redeemLogicForwardProgram.account.redeemLogicConfig.fetch(
			trancheConfigAccountInfo.redeemLogicProgramState
		);

		const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
		const isLinear = redeemLogicAccountInfo.isLinear;
		const notional = redeemLogicAccountInfo.notional.toNumber();
		res.redeemLogicState = new RedeemLogicForwardState(strike, isLinear, notional);
	} catch (err) {
		console.error(err);
	}

	return res;
};

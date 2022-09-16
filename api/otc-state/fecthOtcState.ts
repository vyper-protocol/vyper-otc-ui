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
	res.created_sec = accountInfo.created.toNumber();
	res.depositExpiration_sec = accountInfo.depositEnd.toNumber();
	res.settleAvailableFrom_sec = accountInfo.settleStart.toNumber();
	res.settleExecuted = accountInfo.settleExecuted;
	res.seniorDepositAmount = accountInfo.seniorDepositAmount.toNumber();
	res.juniorDepositAmount = accountInfo.juniorDepositAmount.toNumber();

	res.otcSeniorReserveTokenAccountAmount = Number(
		(await getAccount(provider.connection, accountInfo.otcSeniorReserveTokenAccount)).amount
	);
	res.otcJuniorReserveTokenAccountAmount = Number(
		(await getAccount(provider.connection, accountInfo.otcJuniorReserveTokenAccount)).amount
	);

	res.seniorSideBeneficiaryTokenAccount = accountInfo.seniorSideBeneficiary;
	if (res.seniorSideBeneficiaryTokenAccount) {
		res.seniorSideBeneficiaryOwner = (await getAccount(provider.connection, accountInfo.seniorSideBeneficiary)).owner;
	}

	res.juniorSideBeneficiaryTokenAccount = accountInfo.juniorSideBeneficiary;
	if (res.juniorSideBeneficiaryTokenAccount) {
		res.juniorSideBeneficiaryOwner = (await getAccount(provider.connection, accountInfo.juniorSideBeneficiary)).owner;
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

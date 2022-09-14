import { Address, AnchorProvider, Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { RateSwitchboard, IDL as RateSwitchboardIDL } from 'idls/rate_switchboard';
import { RedeemLogicForward, IDL as RedeemLogicForwardIDL } from 'idls/redeem_logic_forward';
import { VyperCore, IDL as VyperCoreIDL } from 'idls/vyper_core';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { OtcState } from '../../models/OtcState';
import PROGRAMS from '../../configs/programs.json';
import { getAccount } from '@solana/spl-token';
import RateSwitchboardState from 'models/RateSwitchboardState';
import { RedeemLogicForwardState } from 'models/RedeemLogicForwardState';
import { RustDecimalWrapper } from '@vyper-protocol/rust-decimal-wrapper';

export const fetchOtcState = async (provider: AnchorProvider, otcStateAddress: PublicKey): Promise<OtcState> => {
	const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), provider);
	const vyperCoreProgram = new Program<VyperCore>(
		VyperCoreIDL,
		new PublicKey(PROGRAMS.VYPER_CORE_PROGRAM_ID),
		provider
	);
	const redeemLogicForwardProgram = new Program<RedeemLogicForward>(
		RedeemLogicForwardIDL,
		PROGRAMS.REDEEM_LOGIC_FORWARD_PROGRAM_ID,
		provider
	);
	const rateSwitchboardProgram = new Program<RateSwitchboard>(
		RateSwitchboardIDL,
		new PublicKey(PROGRAMS.RATE_SWITCHBOARD_PROGRAM_ID),
		provider
	);

	const accountInfo = await vyperOtcProgram.account.otcState.fetch(otcStateAddress);
	const trancheConfigAccountInfo = await vyperCoreProgram.account.trancheConfig.fetch(accountInfo.vyperTrancheConfig);
	const redeemLogicAccountInfo = await redeemLogicForwardProgram.account.redeemLogicConfig.fetch(
		trancheConfigAccountInfo.redeemLogicProgramState
	);
	const rateStateAccountInfo = await rateSwitchboardProgram.account.rateState.fetch(
		trancheConfigAccountInfo.rateProgramState
	);

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

	res.rateState = new RateSwitchboardState(rateStateAccountInfo.switchboardAggregators[0]);
	try {
		const strike = new RustDecimalWrapper(new Uint8Array(redeemLogicAccountInfo.strike)).toNumber();
		const isLinear = redeemLogicAccountInfo.isLinear;
		const notional = redeemLogicAccountInfo.notional.toNumber();
		res.redeemLogicState = new RedeemLogicForwardState(strike, isLinear, notional);
	} catch (err) {
		console.error(err);
	}

	return res;
};

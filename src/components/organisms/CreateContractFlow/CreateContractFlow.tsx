import { SetStateAction, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Stepper, Step, StepLabel, StepContent, Button, Switch, FormGroup, FormControlLabel, Typography, Stack } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExpiryPicker } from 'components/molecules/ExpiryPicker';
import { OraclesPicker } from 'components/molecules/OraclesPicker';
import { PayoffPicker } from 'components/molecules/PayoffPicker';
import { PreviewModal } from 'components/molecules/PreviewModal';
import { ReservePicker } from 'components/molecules/ReservePicker';
import { RLParamsPicker } from 'components/molecules/RLParamsPicker';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { getPriceForStrike, OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import produce from 'immer';

type StepElement = {
	title: string;
	description: string;
	content: JSX.Element;
	error: boolean;
};

type CreateContractFlowInput = {
	// contract init params state
	contractInitParams: OtcInitializationParams;

	// on contract init params state change
	onContractInitParamsChange: (value: SetStateAction<OtcInitializationParams>) => void;

	// loading during contract creation
	isLoading: boolean;

	// on-chain contract create callback
	onCreateContractButtonClick: () => Promise<void>;

	initialStep?: number;
};

const CreateContractFlow = ({
	contractInitParams,
	onContractInitParamsChange,
	isLoading,
	onCreateContractButtonClick,
	initialStep
}: CreateContractFlowInput) => {
	const wallet = useWallet();
	const { connection } = useConnection();

	const [activeStep, setActiveStep] = useState(initialStep ?? 0);
	const [openPreview, setOpenPreview] = useState(false);
	const handleOpenPreview = () => setOpenPreview(true);
	const handleClosePreview = () => setOpenPreview(false);

	const [expiryError, setExpiryError] = useState(false);
	const [reserveError, setReserveError] = useState(false);

	// TODO fill other errors

	const steps: StepElement[] = [
		{
			title: 'payoff',
			description: 'Select the payoff of your contract from the list available',
			content: (
				<PayoffPicker
					redeemLogicPluginType={contractInitParams.redeemLogicOption.redeemLogicPluginType}
					setRedeemLogicPluginType={(newRedeemLogicType) =>
						onContractInitParamsChange((prevValue) =>
							produce(prevValue, (draft) => {
								draft.redeemLogicOption.redeemLogicPluginType = newRedeemLogicType;
							})
						)
					}
				/>
			),
			error: false
		},
		{
			title: 'underlying',
			description: 'Select the underlying of the contract',
			content: (
				<OraclesPicker
					oracleRequired={contractInitParams.redeemLogicOption.redeemLogicPluginType === 'settled_forward' ? 'double' : 'single'}
					ratePluginType={contractInitParams.rateOption.ratePluginType}
					rateAccounts={contractInitParams.rateOption.rateAccounts}
					setRateAccounts={(newRateType, newRateAccounts) => {
						onContractInitParamsChange((prevValue) =>
							produce(prevValue, (draft) => {
								draft.rateOption.ratePluginType = newRateType;
								draft.rateOption.rateAccounts = newRateAccounts;
							})
						);
						getPriceForStrike(newRateType, newRateAccounts, connection, getCurrentCluster()).then((newStrike) => {
							onContractInitParamsChange((prevValue) =>
								produce(prevValue, (draft) => {
									draft.redeemLogicOption.strike = newStrike;
								})
							);
						});
					}}
				/>
			),
			error: false
		},
		{
			title: 'contract parameters',
			description: 'Select the parameters of the contract',
			content: (
				<RLParamsPicker
					redeemLogicOptions={contractInitParams.redeemLogicOption}
					setRedeemLogicOptions={(newVal) =>
						onContractInitParamsChange((prevValue) =>
							produce(prevValue, (draft) => {
								draft.redeemLogicOption = newVal;
							})
						)
					}
				/>
			),
			error: false
		},
		{
			title: 'collateral',
			description: `Select the token to be used as collateral for the contract${
				getCurrentCluster() === 'devnet' ? '. You can also input your token of choice' : ''
			}`,
			content: (
				<ReservePicker
					seniorDepositAmount={contractInitParams.seniorDepositAmount}
					setSeniorDepositAmount={(newVal) =>
						onContractInitParamsChange((prevVal) =>
							produce(prevVal, (draft) => {
								draft.seniorDepositAmount = newVal;
							})
						)
					}
					juniorDepositAmount={contractInitParams.juniorDepositAmount}
					setJuniorDepositAmount={(newVal) =>
						onContractInitParamsChange((prevVal) =>
							produce(prevVal, (draft) => {
								draft.juniorDepositAmount = newVal;
							})
						)
					}
					reserveMint={contractInitParams.reserveMint}
					setReserveMint={(newVal) =>
						onContractInitParamsChange((prevVal) =>
							produce(prevVal, (draft) => {
								draft.reserveMint = newVal;
							})
						)
					}
					reserveError={reserveError}
					setReserveError={setReserveError}
				/>
			),
			error: reserveError
		},
		{
			title: 'expiry',
			description: 'Select the deposit window and contract expiry',
			content: (
				<ExpiryPicker
					depositEnd={contractInitParams.depositEnd}
					setDepositEnd={(newVal) =>
						onContractInitParamsChange((prevVal) =>
							produce(prevVal, (draft) => {
								draft.depositEnd = newVal;
							})
						)
					}
					settleStart={contractInitParams.settleStart}
					setSettleStart={(newVal) =>
						onContractInitParamsChange((prevVal) =>
							produce(prevVal, (draft) => {
								draft.settleStart = newVal;
							})
						)
					}
					expiryError={expiryError}
					setExpiryError={setExpiryError}
				/>
			),
			error: expiryError
		}
	];

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	return (
		<Box sx={{ width: '100vh' }}>
			<Stepper activeStep={activeStep} orientation="vertical" connector={null}>
				{steps.map((step: StepElement, i: number) => (
					<Step key={step.title} sx={{ width: '100%' }}>
						<Stack direction="row">
							<Box sx={{ width: '40%', flexDirection: 'column', justifyContent: 'space-between' }}>
								<Box sx={{ my: 2 }}>
									<StepLabel error={step.error}>
										<b>{step.title.toUpperCase()}</b>
									</StepLabel>
									{activeStep >= i && <Typography sx={{ fontWeight: 'light' }}>{step.description}</Typography>}
								</Box>
								{i === activeStep && (
									<Box sx={{ display: 'flex' }}>
										<Button disabled={i === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
											Back
										</Button>
										{i === steps.length - 1 ? (
											<Button
												sx={{ mt: 1, mr: 1 }}
												variant="contained"
												disabled={!wallet.connected || openPreview || steps.some(({ error }) => error)}
												onClick={handleOpenPreview}
											>
												{wallet.connected ? 'Preview' : 'Connect Wallet'}
											</Button>
										) : (
											<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }} disabled={step.error}>
												Next
											</Button>
										)}
									</Box>
								)}
							</Box>
							<StepContent sx={{ width: '90%' }} TransitionProps={{ in: activeStep >= i }}>
								{step.content}
							</StepContent>
						</Stack>
					</Step>
				))}
			</Stepper>
			{process.env.NODE_ENV === 'development' && (
				<Box>
					<Button onClick={handleReset}>Reset</Button>
					<FormGroup>
						<FormControlLabel
							control={
								<Switch
									checked={contractInitParams.saveOnDatabase}
									onChange={(e) =>
										onContractInitParamsChange({
											...contractInitParams,
											saveOnDatabase: e.target.checked
										})
									}
								/>
							}
							label="Save on database"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={contractInitParams.sendNotification}
									onChange={(e) =>
										onContractInitParamsChange({
											...contractInitParams,
											sendNotification: e.target.checked
										})
									}
								/>
							}
							label="Send notification"
						/>
					</FormGroup>
				</Box>
			)}
			<PreviewModal
				redeemLogicOption={contractInitParams.redeemLogicOption}
				rateOption={contractInitParams.rateOption}
				depositEnd={contractInitParams.depositEnd}
				settleStart={contractInitParams.settleStart}
				seniorDepositAmount={contractInitParams.seniorDepositAmount}
				juniorDepositAmount={contractInitParams.juniorDepositAmount}
				reserveMint={contractInitParams.reserveMint}
				open={openPreview}
				handleClose={handleClosePreview}
				actionProps={
					<LoadingButton variant="contained" loading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
						{wallet.connected ? 'Create 🚀' : 'Connect Wallet'}
					</LoadingButton>
				}
			/>
		</Box>
	);
};

export default CreateContractFlow;

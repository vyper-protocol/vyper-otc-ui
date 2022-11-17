import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Stepper, Step, StepLabel, StepContent, Button, Switch, FormGroup, FormControlLabel, Typography, Stack } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import ExpiryPicker from 'components/molecules/ExpiryPicker';
import OraclesPicker from 'components/molecules/OraclesPicker';
import ParamsPicker from 'components/molecules/ParamsPicker';
import PayoffPicker from 'components/molecules/PayoffPicker';
import ReservePicker from 'components/molecules/ReservePicker';

type StepElement = {
	title: string;
	description: string;
	content: JSX.Element;
};

const CreateContractFlow = ({
	redeemLogicPluginType,
	setRedeemLogicPluginType,
	strike,
	setStrike,
	notional,
	setNotional,
	isCall,
	setIsCall,
	setRateMain,
	setRate2,
	ratePluginType,
	seniorDepositAmount,
	setSeniorDepositAmount,
	juniorDepositAmount,
	setJuniorDepositAmount,
	setReserveMint,
	depositEnd,
	setDepositEnd,
	settleStart,
	setSettleStart,
	saveOnDatabase,
	setSaveOnDatabase,
	sendNotification,
	setSendNotification,
	isLoading,
	onCreateContractButtonClick
}) => {
	const [activeStep, setActiveStep] = useState(0);
	const wallet = useWallet();

	const steps: StepElement[] = [
		{
			title: 'payoff',
			description: 'Select the payoff of your contract from the list available',
			content: <PayoffPicker redeemLogicPluginType={redeemLogicPluginType} setRedeemLogicPluginType={setRedeemLogicPluginType} />
		},
		{
			title: 'underlying',
			description: 'Select the underlying of the contract',
			content: <OraclesPicker setRateMain={setRateMain} setRate2={setRate2} ratePluginType={ratePluginType} redeemLogicPluginType={redeemLogicPluginType} />
		},
		{
			title: 'contract parameters',
			description: 'Select the parameters of the contract',
			content: (
				<ParamsPicker
					redeemLogicPluginType={redeemLogicPluginType}
					strike={strike}
					setStrike={setStrike}
					notional={notional}
					setNotional={setNotional}
					isCall={isCall}
					setIsCall={setIsCall}
				/>
			)
		},
		{
			title: 'collateral',
			description: 'Select the token mint to be used as collateral for the contract',
			content: (
				<ReservePicker
					seniorDepositAmount={seniorDepositAmount}
					setSeniorDepositAmount={setSeniorDepositAmount}
					juniorDepositAmount={juniorDepositAmount}
					setJuniorDepositAmount={setJuniorDepositAmount}
					setReserveMint={setReserveMint}
				/>
			)
		},
		{
			title: 'expiry',
			description: 'Select the deposit expiry and contract expiry',
			content: <ExpiryPicker depositEnd={depositEnd} setDepositEnd={setDepositEnd} settleStart={settleStart} setSettleStart={setSettleStart} />
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
						{/* <Box sx={{ display: 'inline-flex' }}> */}
						<Stack direction="row">
							<Box sx={{ width: '40%', flexDirection: 'column', justifyContent: 'space-between' }}>
								<Box sx={{ my: 2 }}>
									<StepLabel>
										<b>{step.title.toUpperCase()}</b>
									</StepLabel>
									{activeStep >= i && <Typography sx={{ fontWeight: 'light' }}>{step.description}</Typography>}
								</Box>
								{i === activeStep && (
									<Box>
										<Button disabled={i === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
											Back
										</Button>
										{i === steps.length - 1 ? (
											<LoadingButton
												sx={{ mt: 1, mr: 1 }}
												variant="contained"
												loading={isLoading}
												disabled={!wallet.connected}
												onClick={onCreateContractButtonClick}
											>
												{wallet.connected ? 'Create Contract' : 'Connect Wallet'}
											</LoadingButton>
										) : (
											<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
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
						<FormControlLabel control={<Switch checked={saveOnDatabase} onChange={(e) => setSaveOnDatabase(e.target.checked)} />} label="Save on database" />
						<FormControlLabel
							control={<Switch checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />}
							label="Send notification"
						/>
					</FormGroup>
				</Box>
			)}
		</Box>
	);
};

export default CreateContractFlow;

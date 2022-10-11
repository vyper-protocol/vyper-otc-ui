import { Card, CardContent, Typography } from '@mui/material';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { Badge } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { formatWithDecimalDigits } from 'utils/numberHelpers';

export type ExporerContractCardProps = {
	otcState: ChainOtcState;
	onClick: () => void;
};
const ExporerContractCard = ({ otcState, onClick }: ExporerContractCardProps) => {
	return (
		<Card variant="outlined" sx={{ maxWidth: 400 }} onClick={() => onClick()}>
			<CardContent>
				<Typography width="100%" display="flex" justifyContent="center" alignItems="center">
					<Badge color="purple" margin={6}>
						FORWARD
					</Badge>
					<div style={{ flex: 1 }} />
					{Date.now() > otcState.settleAvailableFromAt ? (
						<Badge color="red" margin={6}>
							Expired
						</Badge>
					) : (
						<Badge color="green" margin={6}>
							Active
						</Badge>
					)}
				</Typography>

				<Typography width="100%" display="flex" justifyContent="center" alignItems="center">
					<Badge color={otcState.isBuyerFunded() ? 'green' : 'red'} margin={6}>
						{otcState.isBuyerFunded() ? 'Long Funded' : 'Long unfunded'}
					</Badge>

					<div style={{ flex: 1 }} />

					<Badge color={otcState.isSellerFunded() ? 'green' : 'red'} margin={6}>
						{otcState.isSellerFunded() ? 'Short Funded' : 'Short unfunded'}
					</Badge>
				</Typography>

				<Typography width="100%" display="flex" justifyContent="center" alignItems="center">
					<strong>{otcState.rateState.getPluginDescription()}</strong>
				</Typography>

				<Typography width="100%" display="flex" alignItems="center">
					notional: {otcState.redeemLogicState.notional}
				</Typography>
				<Typography width="100%" display="flex" alignItems="center">
					strike: {formatWithDecimalDigits(otcState.redeemLogicState.strike)}
				</Typography>
				<Typography width="100%" display="flex" alignItems="center">
					expiry: <MomentTooltipSpan datetime={otcState.depositExpirationAt} />
				</Typography>
			</CardContent>
		</Card>
	);
};

export default ExporerContractCard;

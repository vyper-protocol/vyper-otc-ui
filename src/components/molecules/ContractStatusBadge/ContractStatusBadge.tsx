import { Chip } from '@mui/material';
import { ContractStatusIds } from 'models/ChainOtcState';

type ContractStatusBadgeInput = {
	status: ContractStatusIds;
};

const ContractStatusBadge = ({ status }: ContractStatusBadgeInput) => {
	const getColorFromStatus = (s: ContractStatusIds) => {
		if (s === 'active') return 'success';
		if (s === 'expired') return 'error';

		return 'error';
	};

	const getLabelFromStatus = (s: ContractStatusIds) => {
		if (s === 'active') return 'Active';
		if (s === 'expired') return 'Expired';

		return 'not supported';
	};

	return (
		<Chip
			label={getLabelFromStatus(status)}
			color={getColorFromStatus(status)}
			variant="outlined"
			size="small"
			sx={{ marginX: '3px', textTransform: 'capitalize' }}
		/>
	);
};

export default ContractStatusBadge;

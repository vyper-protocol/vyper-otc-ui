import { Badge } from '@mui/material';
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
		<Badge badgeContent={getLabelFromStatus(status)} color={getColorFromStatus(status)} />
	);
};

export default ContractStatusBadge;

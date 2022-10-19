import { Badge } from 'evergreen-ui';
import { ContractStatusIds } from 'models/ChainOtcState';

type ContractStatusBadgeInput = {
	status: ContractStatusIds;
};

const ContractStatusBadge = ({ status }: ContractStatusBadgeInput) => {
	const getColorFromStatus = (s: ContractStatusIds) => {
		if (s === 'active') return 'green';
		if (s === 'expired') return 'red';

		return 'red';
	};

	const getLabelFromStatus = (s: ContractStatusIds) => {
		if (s === 'active') return 'Active';
		if (s === 'expired') return 'Expired';

		return 'not supported';
	};

	return (
		<Badge color={getColorFromStatus(status)} margin={6}>
			{getLabelFromStatus(status)}
		</Badge>
	);
};

export default ContractStatusBadge;

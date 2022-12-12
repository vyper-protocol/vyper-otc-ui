import StatusBadge from 'components/StatusBadge';
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

	return <StatusBadge label={getLabelFromStatus(status)} mode={getColorFromStatus(status)} />;
};

export default ContractStatusBadge;

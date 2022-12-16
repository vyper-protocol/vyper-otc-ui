import { Tooltip } from '@mui/material';
import StatusBadge from 'components/StatusBadge';
import _ from 'lodash';
import { ContractStatusIds } from 'models/common';

type ContractStatusBadgeInput = {
	status: ContractStatusIds;
};

const getColorFromStatus = (s: ContractStatusIds): 'success' | 'error' | 'dark' | 'info' | 'warning' => {
	if (s === 'unfunded') return 'dark';
	if (s === 'wtb') return 'warning';
	if (s === 'wts') return 'warning';
	if (s === 'live') return 'success';
	if (s === 'settled') return 'success';
	if (s === 'expired') return 'info';

	return 'error';
};

const getLabelFromStatus = (s: ContractStatusIds) => {
	return _.startCase(s);
};

const getTooltipTitle = (s: ContractStatusIds): string => {
	if (s === 'unfunded') return 'Neither long or short has deposited';
	if (s === 'wtb') return 'Only buyer has deposited';
	if (s === 'wts') return 'Only seller has deposited';
	if (s === 'live') return 'Both sides have deposited and the contract has not yet settled';
	if (s === 'settled') return 'Both sides have deposited and the contract has settled';
	if (s === 'expired') return 'Deposit period is over and the contract has not been funded by both sides';

	return '';
};

const ContractStatusBadge = ({ status }: ContractStatusBadgeInput) => {
	const tooltipTitle = getTooltipTitle(status);
	const badgeLabel = getLabelFromStatus(status);
	const badgeMode = getColorFromStatus(status);

	return (
		<Tooltip title={tooltipTitle} placement="left">
			<div>
				<StatusBadge label={badgeLabel} mode={badgeMode} />
			</div>
		</Tooltip>
	);
};

export default ContractStatusBadge;

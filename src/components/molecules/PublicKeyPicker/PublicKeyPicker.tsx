import { useState } from 'react';

import { Box, Autocomplete, Typography, TextField, CircularProgress } from '@mui/material';
import _ from 'lodash';

type PublicKeyLabel = {
	label: string;
	pubkey: string;
	type: string;
	category?: string;
};

export type PublicKeyPickerInput = {
	title: string;
	publicKeyLabels: PublicKeyLabel[];
	onChange: (input: string) => Promise<void>;
	free: boolean;
	value: string;
};

export const PublicKeyPicker = ({ title, publicKeyLabels, onChange, free, value }: PublicKeyPickerInput) => {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<Autocomplete
			disabled={isLoading}
			sx={{ width: 300, marginY: 2 }}
			disableClearable
			autoHighlight
			selectOnFocus
			clearOnBlur
			handleHomeEndKeys
			freeSolo={free}
			value={value}
			onInputChange={async (e, input: string, reason: string) => {
				if (reason !== 'input') return;
				if (free) {
					await onChange(input);
				}
			}}
			options={_.sortBy(publicKeyLabels, ['category'], ['asc']) as PublicKeyLabel[]}
			groupBy={(pubkeyOrOther: PublicKeyLabel | string) => {
				if (typeof pubkeyOrOther === 'object') {
					return pubkeyOrOther.category ?? 'Other';
				} else {
					return 'Other';
				}
			}}
			getOptionLabel={(pubkeyOrOther: PublicKeyLabel | string) => {
				if (typeof pubkeyOrOther === 'object') {
					return pubkeyOrOther.label;
				} else {
					return pubkeyOrOther;
				}
			}}
			onChange={async (e, pubkeyOrOther: PublicKeyLabel | string) => {
				if (typeof pubkeyOrOther === 'object') {
					setIsLoading(true);
					await onChange(pubkeyOrOther.label);
					setIsLoading(false);
				} else {
					setIsLoading(true);
					await onChange(pubkeyOrOther);
					setIsLoading(false);
				}
			}}
			renderOption={(props, option: PublicKeyLabel) => (
				<Box component="li" {...props}>
					<Typography align="left">{option.label}</Typography>
					<Typography sx={{ color: 'grey', ml: 0.8, fontSize: '0.7em' }} align="right">
						{option?.type.toUpperCase()}
					</Typography>
				</Box>
			)}
			renderInput={(params) => (
				<TextField
					{...params}
					label={title}
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<div>
								{isLoading ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</div>
						)
					}}
				/>
			)}
		/>
	);
};

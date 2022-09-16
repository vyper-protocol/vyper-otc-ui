/* eslint-disable css-modules/no-unused-class */
import React, { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import cn from 'classnames';
import { Button, Pane, SearchInput, Text } from 'evergreen-ui';
import { useRouter } from 'next/router';

import styles from './SearchBar.module.scss';

type SearchBarProps = {
	searchState: {
		value: string;
		setValue: React.Dispatch<any>;
	};
	className?: string;
};

const SearchBar = ({ searchState, className }: SearchBarProps) => {
	const router = useRouter();

	const [hasError, setHasError] = useState(false);

	const handleSubmit = () => {
		try {
			new PublicKey(searchState.value);
			router.push(`/contract/summary/${searchState.value}`);
			setHasError(false);
			searchState.setValue('');
		} catch (err) {
			setHasError(true);
			return;
		}
	};

	return (
		<Pane className={cn(styles.wrapper, className)}>
			<Pane marginRight={4}>
				<SearchInput
					onChange={(e) => {
						return searchState.setValue(e.target.value);
					}}
					value={searchState.value}
					placeholder="Search for contract with pubkey..."
				/>

				<Text className={cn(styles.error, !hasError ? styles.hidden : styles.visible)}>Invalid Public Key</Text>
			</Pane>

			<Button onClick={handleSubmit} appearance="primary">
				Submit
			</Button>
		</Pane>
	);
};

export default SearchBar;

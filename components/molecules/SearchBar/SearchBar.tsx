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
};

const SearchBar = ({ searchState }: SearchBarProps) => {
	const router = useRouter();

	const [hasError, setHasError] = useState(false);

	const handleSubmit = () => {
		router.push(`/contract/summary/${searchState.value}`);
		try {
			new PublicKey(searchState.value);
			setHasError(false);
			searchState.setValue('');
		} catch (err) {
			setHasError(true);
		}
	};

	// test : WD2TKRpqhRHMJ92hHndCZx1Y4rp9fPBtAAV3kzMYKu3

	return (
		<Pane className={styles.wrapper}>
			<Pane>
				<SearchInput
					onChange={(e) => {
						return searchState.setValue(e.target.value);
					}}
					value={searchState.value}
					placeholder="Search for contract with pubkey..."
				/>
				<Text className={cn(styles.error, !hasError ? styles.hidden : styles.visible)}>Invalid Public Key</Text>
			</Pane>

			<Button onClick={handleSubmit}>Submit</Button>
		</Pane>
	);
};

export default SearchBar;

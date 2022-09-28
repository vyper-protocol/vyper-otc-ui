/* eslint-disable css-modules/no-unused-class */
import React, { useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import cn from 'classnames';
import { Pane, Text, SearchIcon, ErrorIcon } from 'evergreen-ui';
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

	const handleEnterPress = (event) => {
		if (event.keyCode === 13) {
			try {
				new PublicKey(searchState.value);
				router.push(`/contract/summary/${searchState.value}`);
				setHasError(false);
				searchState.setValue('');
			} catch (err) {
				setHasError(true);
				return;
			}
		}
	};

	return (
		<Pane className={cn(styles.wrapper, className)}>
			<Pane>
				<div className={cn(hasError && styles.error_border, styles.input_outter)}>
					<SearchIcon className={styles.adorsement} />
					<input
						type="text"
						onChange={(e) => {
							return searchState.setValue(e.target.value);
						}}
						value={searchState.value}
						placeholder="Search for contract with public key..."
						onKeyDown={handleEnterPress}
					/>
				</div>

				<Text className={cn(styles.error, !hasError ? styles.hidden : styles.visible)}>
					{' '}
					<ErrorIcon />
					Invalid Public Key
				</Text>
			</Pane>
		</Pane>
	);
};

export default SearchBar;

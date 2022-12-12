/* eslint-disable css-modules/no-unused-class */
import React, { useState } from 'react';

import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import { PublicKey } from '@solana/web3.js';
import cn from 'classnames';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

import styles from './SearchBar.module.scss';

type SearchBarProps = {
	searchState: {
		value: string;
		setValue: React.Dispatch<any>;
	};
	className?: string;
};

const SearchBar = ({ searchState, className }: SearchBarProps) => {
	const [hasError, setHasError] = useState(false);

	const router = useRouter();

	const handleEnterPress = (event) => {
		if (event.keyCode === 13) {
			try {
				const pubkey = new PublicKey(searchState.value);

				router.push(UrlBuilder.buildContractSummaryUrl(pubkey.toBase58()));

				setHasError(false);
				searchState.setValue('');
			} catch (err) {
				setHasError(true);
				return;
			}
		}
	};

	return (
		<div className={cn(styles.wrapper, className)}>
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

			<p className={cn(styles.error, !hasError ? styles.hidden : styles.visible)}>
				{' '}
				<ErrorIcon />
				Invalid Public Key
			</p>
		</div>
	);
};

export default SearchBar;

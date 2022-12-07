/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';
import { AnchorProvider, IdlAccounts, Program } from '@project-serum/anchor';
import { getAccount } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import ButtonPill from 'components/atoms/ButtonPill';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { fundContract } from 'controllers/fundContract';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { VyperOtc, IDL as VyperOtcIDL } from 'idls/vyper_otc';
import { useRouter } from 'next/router';
import { getTokenAmount } from 'utils/solanaHelper';
import * as UrlBuilder from 'utils/urlBuilder';

import PROGRAMS from '../../../configs/programs.json';

const DepositButton = ({ otcStatePubkey, isLong }: { otcStatePubkey: string; isLong: boolean }) => {
	const router = useRouter();
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);
	const isSeller = !isLong;

	const sendNotification = process.env.NEXT_PUBLIC_LIVE_ENVIRONMENT === 'production';

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const checkTokenAmount = useCallback(async () => {
		try {
			const requiredAmount = isLong ? rateStateQuery.data.buyerDepositAmount : rateStateQuery.data.sellerDepositAmount;
			const mintInfo = rateStateQuery.data.collateralMintInfo;
			const tokenAmount = await getTokenAmount(connection, wallet.publicKey, mintInfo.address);
			if (tokenAmount / BigInt(10 ** mintInfo.decimals) >= requiredAmount) setIsButtonDisabled(false);
			else setIsButtonDisabled(true);
		} catch (err) {
			console.error(err);
		}
	}, [
		isLong,
		rateStateQuery.data.buyerDepositAmount,
		rateStateQuery.data.sellerDepositAmount,
		rateStateQuery.data.collateralMintInfo,
		connection,
		wallet.publicKey
	]);

	useEffect(() => {
		checkTokenAmount();
	}, [checkTokenAmount]);

	// flag for is available fetched in realtime via ws
	const [isAvailable, setIsAvailable] = useState(true);

	// listen for account changes
	useEffect(() => {
		const subscriptionId = connection.onAccountChange(
			new PublicKey(otcStatePubkey),
			async (updatedAccountInfo) => {
				const vyperOtcProgram = new Program<VyperOtc>(VyperOtcIDL, new PublicKey(PROGRAMS.VYPER_OTC_PROGRAM_ID), new AnchorProvider(connection, undefined, {}));
				const otcStateUpdate = vyperOtcProgram.coder.accounts.decode<IdlAccounts<VyperOtc>['otcState']>('otcState', updatedAccountInfo.data);

				if (otcStateUpdate.seniorSideBeneficiary !== null) {
					if (isLong) {
						// buyer already take
						setIsAvailable(false);
					} else if (wallet?.publicKey) {
						// settler not available if I'm the buyer
						const seniorSideBeneficiary = await getAccount(connection, otcStateUpdate.seniorSideBeneficiary);
						if (seniorSideBeneficiary.owner.equals(wallet.publicKey)) {
							setIsAvailable(false);
						}
					}
				}

				if (otcStateUpdate.juniorSideBeneficiary !== null) {
					if (isSeller) {
						// seller already take
						setIsAvailable(false);
					} else if (wallet?.publicKey) {
						// buyer not available if I'm the seller
						const juniorSideBeneficiary = await getAccount(connection, otcStateUpdate.juniorSideBeneficiary);
						if (juniorSideBeneficiary.owner.equals(wallet.publicKey)) {
							setIsAvailable(false);
						}
					}
				}
			},
			'confirmed'
		);

		return () => {
			connection.removeAccountChangeListener(subscriptionId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDepositClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.altKey) {
			router.push(UrlBuilder.buildDepositQRCodeUrl(otcStatePubkey, isLong));
		} else {
			try {
				setIsLoading(true);
				await fundContract(provider, txHandler, new PublicKey(otcStatePubkey), rateStateQuery?.data, isLong, sendNotification);
			} catch (err) {
				console.log(err);
			} finally {
				setIsLoading(false);
				rateStateQuery.refetch();
			}
		}
	};

	if (isLong) {
		if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositLongAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositShortAvailable(wallet.publicKey)) {
		return <></>;
	}

	if (!isAvailable) {
		return <></>;
	}
	return (
		<Tooltip title={isButtonDisabled ? 'Not enough tokens' : ''}>
			<div style={{ display: 'flex', flex: 1 }}>
				<ButtonPill
					mode={isButtonDisabled ? 'disabled' : isLong ? 'success' : 'error'}
					text={isLong ? 'Long' : 'Short'}
					onClick={onDepositClick}
					loading={isLoading}
					disabled={isButtonDisabled}
				/>
			</div>
		</Tooltip>
	);
};

export default DepositButton;

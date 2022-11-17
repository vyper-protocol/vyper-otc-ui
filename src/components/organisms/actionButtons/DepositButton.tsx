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

const DepositButton = ({ otcStatePubkey, isBuyer }: { otcStatePubkey: string; isBuyer: boolean }) => {
	const router = useRouter();
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);
	const isSeller = !isBuyer;

	const provider = new AnchorProvider(connection, wallet, {});
	const rateStateQuery = useGetFetchOTCStateQuery(connection, otcStatePubkey);
	const [isLoading, setIsLoading] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	const checkTokenAmount = useCallback(async () => {
		try {
			const requiredAmount = isBuyer ? rateStateQuery.data.buyerDepositAmount : rateStateQuery.data.sellerDepositAmount;
			const mintInfo = rateStateQuery.data.reserveMintInfo;
			const tokenAmount = await getTokenAmount(connection, wallet.publicKey, mintInfo.address);
			if (tokenAmount / BigInt(10 ** mintInfo.decimals) >= requiredAmount) setIsButtonDisabled(false);
			else setIsButtonDisabled(true);
		} catch (err) {
			console.error(err);
		}
	}, [
		isBuyer,
		rateStateQuery.data.buyerDepositAmount,
		rateStateQuery.data.sellerDepositAmount,
		rateStateQuery.data.reserveMintInfo,
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

				console.log('otcStateUpdate.seniorSideBeneficiary: ' + otcStateUpdate.seniorSideBeneficiary);
				console.log('otcStateUpdate.juniorSideBeneficiary: ' + otcStateUpdate.juniorSideBeneficiary);

				if (otcStateUpdate.seniorSideBeneficiary !== null) {
					if (isBuyer) {
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
			router.push(UrlBuilder.buildDepositQRCodeUrl(otcStatePubkey, isBuyer));
		} else {
			try {
				setIsLoading(true);
				await fundContract(provider, txHandler, new PublicKey(otcStatePubkey), isBuyer);
			} catch (err) {
				console.log(err);
			} finally {
				setIsLoading(false);
				rateStateQuery.refetch();
			}
		}
	};

	if (isBuyer) {
		if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositBuyerAvailable(wallet.publicKey)) {
			return <></>;
		}
	} else if (rateStateQuery?.data === undefined || !rateStateQuery?.data?.isDepositSellerAvailable(wallet.publicKey)) {
		return <></>;
	}

	if (!isAvailable) {
		return <></>;
	}
	return (
		<Tooltip title={isButtonDisabled ? 'Not enough tokens' : ''}>
			<div style={{ display: 'flex', flex: 1 }}>
				<ButtonPill
					mode={isButtonDisabled ? 'disabled' : isBuyer ? 'success' : 'error'}
					text={isBuyer ? 'Long' : 'Short'}
					onClick={onDepositClick}
					loading={isLoading}
					disabled={isButtonDisabled}
				/>
			</div>
		</Tooltip>
	);
};

export default DepositButton;

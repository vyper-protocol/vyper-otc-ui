/* eslint-disable no-console */
import { useRouter } from 'next/router';

const REFERRAL_URL_KEY = 'friend';

export const useURLReferralCode = (): string | undefined => {
	const { query } = useRouter();
	const referralCode = query[REFERRAL_URL_KEY]?.toString();
	if (referralCode) console.log('referral code: ', referralCode);
	return referralCode;
};

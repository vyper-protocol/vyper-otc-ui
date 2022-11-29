import { TokenInfo } from 'models/TokenInfo';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import omit from 'lodash-es/omit';

interface CacheStore {
	tokenInfos: TokenInfo[];
	addTokenInfo: (v: TokenInfo) => void;
	removeAllTokenInfo: () => void;
}

const useTokenInfoStore = create<CacheStore>()(
	devtools(
		persist(
			(set) => ({
				tokenInfos: [],
				addTokenInfo: (newTokenInfo: TokenInfo) => set((state) => ({ tokenInfos: [...state.tokenInfos, newTokenInfo] })),
				removeAllTokenInfo: () => set((state) => omit(state, ['contractData']), true)
			}),
			{
				name: 'otc-token-info-storage'
			}
		),
		{ enabled: process.env.NODE_ENV === 'development' }
	)
);

export default useTokenInfoStore;

import produce from 'immer';
import omit from 'lodash-es/omit';
import { TokenInfo } from 'models/TokenInfo';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
				addTokenInfo: (newTokenInfo: TokenInfo) =>
					set((state) =>
						produce(state, (draft) => {
							draft.tokenInfos.push(newTokenInfo);
						})
					),
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

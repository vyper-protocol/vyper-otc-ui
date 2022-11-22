import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import omit from 'lodash-es/omit';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface CloneContractStore {
	contractData?: OtcInitializationParams;
	create: (data: OtcInitializationParams) => void;
	delete: () => void;
}

const useContractStore = create<CloneContractStore>()(
	devtools(
		(set) => ({
			create: (data) => set(() => ({ contractData: data })),
			delete: () => set((state) => omit(state, ['contractData']), true)
		}),
		{ enabled: process.env.NODE_ENV === 'development' ? true : false }
	)
);

export default useContractStore;

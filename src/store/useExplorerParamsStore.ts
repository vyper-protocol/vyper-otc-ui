import { GridFilterModel, GridSortModel } from '@mui/x-data-grid-pro';
import produce from 'immer';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ExplorerParamsStore {
	filterModel: GridFilterModel;
	sortModel: GridSortModel;
	setSortModel: (v: GridSortModel) => void;
	setFilterModel: (v: GridFilterModel) => void;
}

const useExplorerParamsStore = create<ExplorerParamsStore>()(
	devtools(
		persist(
			(set) => ({
				filterModel: { items: [] },
				sortModel: [],
				setSortModel: (v: GridSortModel) => {
					set((state) =>
						produce(state, (draft) => {
							draft.sortModel = v;
						})
					);
				},
				setFilterModel: (v: GridFilterModel) => {
					set((state) =>
						produce(state, (draft) => {
							draft.filterModel = v;
						})
					);
				}
			}),
			{
				name: 'otc-explorer-params-storage'
			}
		),
		{ enabled: process.env.NODE_ENV === 'development' }
	)
);

export default useExplorerParamsStore;

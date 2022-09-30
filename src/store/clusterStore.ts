/* eslint-disable no-unused-vars */
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Cluster = 'devnet' | 'mainnet-beta';

interface ClusterStoreState {
	cluster: Cluster;
	switchCluster: (option: Cluster) => void;
}

export const useClusterStore = create<ClusterStoreState>()(
	devtools(
		persist(
			(set) => {
				return {
					cluster: 'devnet',
					switchCluster: (option: Cluster) => {
						return set(() => {
							return {
								cluster: option
							};
						});
					}
				};
			},
			{
				name: 'cluster-store'
			}
		)
	)
);

import ExplorerContractDataGrid from 'components/organisms/ExplorerContractDataGrid';
import Layout from 'components/templates/Layout';

const ExplorerPage = () => {
	return (
		<Layout pageTitle={'Contract Explorer'} withSearch>
			<ExplorerContractDataGrid />
		</Layout>
	);
};

export default ExplorerPage;

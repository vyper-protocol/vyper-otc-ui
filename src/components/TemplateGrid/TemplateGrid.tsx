import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TemplateCard, TemplateCardProps } from 'components/TemplateCard';
import templateData from 'configs/templates.json';

import styles from './TemplateGrid.module.scss';

const TemplateGrid = () => {
	const templateList = templateData.templates.filter((c) => c.cluster === getCurrentCluster()) as TemplateCardProps[];

	return (
		<div className={styles.container}>
			{templateList.map((v, i) => (
				<TemplateCard key={i} {...v} />
			))}
		</div>
	);
};

export default TemplateGrid;

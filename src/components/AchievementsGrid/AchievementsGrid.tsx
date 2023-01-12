import Image from 'next/image';
import Link from 'next/link';
import achievementsData from 'configs/achievements.json';
import styles from './AchievementsGrid.module.scss';

const AchievementsGrid = () => {
	const achievementsList = achievementsData.achievements;

	return (
		<div className={styles.box}>
			<div className={styles.title}>
				<h2>Featured & Backed by</h2>
			</div>
			<div className={styles.grid}>
				{achievementsList.map((achievement) => (
					<Link href={achievement.link} key={achievement.link}>
						<div className={styles.item}>
							<Image src={achievement.image} layout="fill" objectFit="contain" />
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default AchievementsGrid;

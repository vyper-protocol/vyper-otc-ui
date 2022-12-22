import { TemplateCardProps, TemplateCard } from "../TemplateCard";
import styles from "./UserStory.module.scss";

export type UserStoryProps = {
    template: TemplateCardProps,
    story: string
};

export const UserStory = ({
    template,
    story
}: UserStoryProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.story}>
                <div className={styles.storyPrefix}>I want to...</div>
                <div className={styles.storyBody}>{ story }</div>
            </div>
            <TemplateCard {...template} />
        </div>
    );
};
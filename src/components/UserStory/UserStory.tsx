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
                { story }
            </div>
            <TemplateCard {...template} />
        </div>
    )
};
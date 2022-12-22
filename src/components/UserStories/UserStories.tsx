import Carousel from "react-material-ui-carousel";
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { UserStory } from "components/UserStory";
import { TemplateCardProps } from "components/TemplateCard";
import templateData from 'configs/templates.json';
import styles from "./UserStories.module.scss";

const UserStories = () => {
  const templateList = templateData.templates.filter((c) => c.cluster === getCurrentCluster()) as TemplateCardProps[];

  return (
    <Carousel
        className={styles.carousel}
        navButtonsAlwaysVisible={true}
        animation="slide"
        duration={600}
        navButtonsProps={{
            style: {
                backgroundColor: 'transparent',
                color: "#494949"
            }
        }} 
    >
        <UserStory story="I want to buy an option but... I don't know what to do?" template={templateList[0]} />
        <UserStory story="This is a story" template={templateList[0]} />
    </Carousel>
  )
}
export default UserStories;

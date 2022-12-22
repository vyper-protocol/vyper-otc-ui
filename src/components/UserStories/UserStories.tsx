import Carousel from 'react-material-ui-carousel';
import { UserStory } from 'components/UserStory';
import storyData from 'configs/stories';
import styles from './UserStories.module.scss';

const UserStories = () => {
  return (
    <Carousel
        className={styles.carousel}
        navButtonsAlwaysVisible={true}
        duration={600}
        navButtonsProps={{
            style: {
                backgroundColor: 'transparent',
                color: '#494949'
            }
        }}
    >
        {
          storyData.map((story, i) => (
            <UserStory key={i} story={story.story} template={story.template} />
          ))
        }
    </Carousel>
  )
};

export default UserStories;

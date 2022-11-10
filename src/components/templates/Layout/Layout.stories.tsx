import { ComponentMeta, ComponentStory } from '@storybook/react';

import backgroundImage from '../../../../public/background.webp';
import Layout from './Layout';

export default {
	title: 'components/templates/Layout',
	component: Layout
} as ComponentMeta<typeof Layout>;

const Template: ComponentStory<typeof Layout> = (args) => <Layout {...args} />;

export const Base = Template.bind({});
Base.args = {};

export const WithSearch = Template.bind({});
WithSearch.args = {
	withSearch: true
};

export const WithBackgroundImage = Template.bind({});
WithBackgroundImage.args = {
	withSearch: true,
	withBackgroundImage: backgroundImage
};

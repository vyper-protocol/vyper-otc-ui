import { ComponentMeta, ComponentStory } from '@storybook/react';

import Icon from './Icon';

export default {
	title: 'components/Icon',
	component: Icon
} as ComponentMeta<typeof Icon>;

const Template: ComponentStory<typeof Icon> = (args) => <Icon {...args} />;

export const Base = Template.bind({});
Base.args = {
	name: 'FaDiscord',
	size: '48px',
	color: '#5965F3'
};

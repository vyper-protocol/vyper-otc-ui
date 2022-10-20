import { ComponentMeta, ComponentStory } from '@storybook/react';

import Simulator from './Simulator';

export default {
	title: 'components/organisms/Simulator',
	component: Simulator
} as ComponentMeta<typeof Simulator>;

const Template: ComponentStory<typeof Simulator> = (args) => <Simulator {...args} />;

export const PriceSimulator = Template.bind({});

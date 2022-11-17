import { ComponentMeta, ComponentStory } from '@storybook/react';

import ApplicationError from './ApplicationError';

export default {
	title: 'components/templates/ApplicationError',
	component: ApplicationError
} as ComponentMeta<typeof ApplicationError>;

const Template: ComponentStory<typeof ApplicationError> = (args) => <ApplicationError {...args} />;

export const Base = Template.bind({});
Base.args = {};

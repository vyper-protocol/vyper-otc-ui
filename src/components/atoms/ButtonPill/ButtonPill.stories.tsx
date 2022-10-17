import { ComponentMeta, ComponentStory } from '@storybook/react';

import ButtonPill from './ButtonPill';

export default {
	title: 'components/atoms/ButtonPill',
	component: ButtonPill
} as ComponentMeta<typeof ButtonPill>;

const Template: ComponentStory<typeof ButtonPill> = (args) => <ButtonPill {...args} />;

export const Success = Template.bind({});
Success.args = {
	text: 'Create Contract',
	mode: 'success'
};

export const Error = Template.bind({});
Error.args = {
	text: 'Create Contract',
	mode: 'error'
};

export const Info = Template.bind({});
Info.args = {
	text: 'Create Contract',
	mode: 'info'
};

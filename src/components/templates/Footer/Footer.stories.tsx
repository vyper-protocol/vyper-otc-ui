import { ComponentMeta, ComponentStory } from '@storybook/react';

import Footer from './Footer';

export default {
	title: 'components/templates/Footer',
	component: Footer
} as ComponentMeta<typeof Footer>;

const Template: ComponentStory<typeof Footer> = () => <Footer />;

export const Base = Template.bind({});
Base.args = {};

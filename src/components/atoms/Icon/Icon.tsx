import { IconBaseProps } from 'react-icons';
import { FaDiscord, FaTwitter } from 'react-icons/fa';

const ICONS_MAP = {
	FaDiscord: FaDiscord,
	FaTwitter: FaTwitter
};

export type AvailableIconNames = keyof typeof ICONS_MAP;

type Props = {
	name: AvailableIconNames;
} & IconBaseProps;

const Icon = (props: Props) => {
	const { name, ...rest } = props;

	const SvgComponent = ICONS_MAP[name];
	return <SvgComponent {...rest} />;
};

export default Icon;

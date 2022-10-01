import { IconBaseProps } from 'react-icons';
import { FaDiscord, FaGithub, FaGlobe, FaMedium, FaTwitter } from 'react-icons/fa';
import { MdArticle } from 'react-icons/md';

const ICONS_MAP = {
	FaDiscord: FaDiscord,
	FaGithub: FaGithub,
	FaGlobe: FaGlobe,
	FaMedium: FaMedium,
	FaTwitter: FaTwitter,
	MdArticle: MdArticle
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

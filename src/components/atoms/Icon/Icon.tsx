import { IconBaseProps } from 'react-icons';
import { FaDiscord, FaGithub, FaGlobe, FaMedium, FaTwitter, FaTelegram } from 'react-icons/fa';
import { MdArticle } from 'react-icons/md';

const ICONS_MAP = {
	FaDiscord: FaDiscord,
	FaGithub: FaGithub,
	FaGlobe: FaGlobe,
	FaMedium: FaMedium,
	FaTwitter: FaTwitter,
	FaTelegram: FaTelegram,
	MdArticle: MdArticle
};

export type AvailableIconNames = keyof typeof ICONS_MAP;

type Props = {
	/**
	 * Name of the icon
	 */
	name: AvailableIconNames;
} & IconBaseProps;

const Icon = (props: Props) => {
	const { name, ...rest } = props;

	const SvgComponent = ICONS_MAP[name];
	return <SvgComponent {...rest} />;
};

export default Icon;

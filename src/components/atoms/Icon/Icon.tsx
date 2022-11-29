import { IconBaseProps } from 'react-icons';
import { AiFillWarning } from 'react-icons/ai';
import { FaDiscord, FaGithub, FaGlobe, FaMedium, FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { MdArticle } from 'react-icons/md';

const ICONS_MAP = {
	FaDiscord: FaDiscord,
	FaGithub: FaGithub,
	FaGlobe: FaGlobe,
	FaMedium: FaMedium,
	FaTwitter: FaTwitter,
	FaTelegramPlane: FaTelegramPlane,
	MdArticle: MdArticle,
	AiFillWarning: AiFillWarning
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

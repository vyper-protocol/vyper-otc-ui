import { IconBaseProps } from 'react-icons';
import { AiFillWarning } from 'react-icons/ai';
import { FaDiscord, FaGithub, FaGlobe, FaMedium, FaTwitter, FaTelegramPlane, FaUserFriends, FaSearch, FaChartLine } from 'react-icons/fa';
import { GiImprisoned } from 'react-icons/gi';
import { IoIosRocket } from 'react-icons/io';
import { MdArticle } from 'react-icons/md';

const ICONS_MAP = {
	FaDiscord: FaDiscord,
	FaGithub: FaGithub,
	FaGlobe: FaGlobe,
	FaMedium: FaMedium,
	FaTwitter: FaTwitter,
	FaTelegramPlane: FaTelegramPlane,
	MdArticle: MdArticle,
	AiFillWarning: AiFillWarning,
	GiImprisoned: GiImprisoned,
	IoIosRocket: IoIosRocket,
	FaUserFriends: FaUserFriends,
	FaSearch: FaSearch,
	FaChartLine: FaChartLine
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

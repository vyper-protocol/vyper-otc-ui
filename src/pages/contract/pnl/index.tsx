import { Box } from '@mui/material';
import SocialImg from 'components/molecules/SocialImg';

const myImg = () => {
	return (
		<Box sx={{ width: 50, height: 50, position: 'fixed', top: '50%', left: '50%' }}>
			<SocialImg />
		</Box>
	);
};

export default myImg;

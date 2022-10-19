import { useState } from 'react';

import cn from 'classnames';
import { TextInput } from 'evergreen-ui';

import styles from './Simulator.module.scss';

type SimulatorProps = {} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ className }: SimulatorProps) => {
	const [price, setPrice] = useState(0);

	const handleOnChange = (e) => {
		setPrice(e.target.value);
	};

	return (
		<div className={cn(styles.wrapper, className)}>
			<p className={styles.title}>Simulate your P/L</p>
			<div className={cn(styles.flex, styles.margin)}>
				<p>Price: </p>
				<TextInput style={{ width: '70%' }} value={price} onChange={handleOnChange} />
			</div>
			<div className={styles.margin}>
				<div className={cn(styles.flex, styles.row)}>
					<p>Price</p>
					<p>{price}</p>
				</div>
				<div className={styles.flex}>
					<p>Strike</p>
					<p>30</p>
				</div>
				<div className={cn(styles.flex, styles.row)}>
					<p>Size</p>
					<p>1</p>
				</div>
			</div>
			<div className={cn(styles.flex, styles.margin)}>
				<div className={styles.center}>
					<p>Long</p>
					<p>-34 USDC</p>
				</div>
				<div className={styles.center}>
					<p>Short</p>
					<p>68 USDC</p>
				</div>
			</div>
		</div>
	);
};

export default Simulator;

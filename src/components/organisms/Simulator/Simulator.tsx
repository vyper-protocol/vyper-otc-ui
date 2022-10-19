import cn from 'classnames';

import styles from './Simulator.module.scss';

type SimulatorProps = {} & React.HTMLProps<HTMLDivElement>;

const Simulator = ({ className }: SimulatorProps) => {
	return <div className={cn(styles.wrapper, className)}>Simulator</div>;
};

export default Simulator;

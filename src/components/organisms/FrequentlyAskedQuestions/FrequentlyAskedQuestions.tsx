import * as React from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

import styles from './FrequentlyAskedQuestions.module.scss';

const FrequentlyAskedQuestions = () => {
	return (
		<div className={styles.box}>
			<div className={styles.faqtitle}>
				<h2>Frequently Asked Questions</h2>
			</div>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>
						<b>What is Vyper OTC?</b>
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Vyper OTC is a peer-to-peer marketplace that allows anyone to trade a wide range of on-chain derivatives in a transparent and easy way. Users can
						choose from a wide range of assets and trade securely thanks to fully collateralized positions.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
					<Typography>
						<b>Is Vyper an exchange?</b>
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Vyper leverages an exchange model, meaning that we do not take on any risk and all trades are matched between a buyer and a seller directly. Users
						can trade a large variety of derivatives on a broad set of assets using various currencies as collateral.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>
						<b>How is this different from other exchanges (CEX/DEX)?</b>
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Vyper OTC supports a large number of assets and payoffs which you can not find on other exchanges, be it crypto but also more traditional assets
						such as commodities, volatility and FX. Every trade is segregated and deployed as a separate smart contract meaning that Vyper is less susceptible
						to oracle attacks.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>
						<b>What assets are available on Vyper OTC?</b>
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						With Vyper every data feed provided by oracles can become a tradeable asset on Vyper OTC. Currently we support all data feeds from Pyth and
						Switchboard, you can select an existing data-feed or create your own.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</div>
	);
};

export default FrequentlyAskedQuestions;

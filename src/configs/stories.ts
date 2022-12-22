import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { UserStoryProps } from 'components/UserStory';

const collateralMint = getCurrentCluster() === 'devnet' ? '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const Stories: UserStoryProps[] = [{
    story: "I want to buy an option on $DOGE",
    template: {
        collateralMint,
        longDepositAmount: 10,
        shortDepositAmount: 100,
        aliasId: "vanilla_option",
        payoff: "vanilla_option",
        payoffData: { notional: 1, isCall: true, isLinear: "true" },
        expiry: "monthly",
        underlying: "DOGE/USD",
        imgPath: "/doge-logo.png",
        rateId: "pyth"
    }
}, {
    story: "I want to short this altcoin but it is impossible to borrow it",
    template: {
        collateralMint,
        longDepositAmount: 100,
        shortDepositAmount: 100,
        aliasId: "forward",
        payoff: "forward",
        payoffData: { notional: 1, isLinear: "true" },
        expiry: "monthly",
        underlying: "FTT/USD",
        imgPath: "/ftt-logo.png",
        rateId: "pyth"
    }
}, {
    story: "I want to get exposure to traditional assets with crypto",
    template: {
        collateralMint,
        longDepositAmount: 100,
        shortDepositAmount: 100,
        aliasId: "forward",
        payoff: "forward",
        payoffData: { notional: 1, isLinear: "true" },
        expiry: "monthly",
        underlying: "AAPL/USD",
        imgPath: "/aapl-logo.png",
        rateId: "pyth"
    }
}, {
    story: "I want to hedge an existing position in De-Fi protocol",
    template: {
        collateralMint,
        longDepositAmount: 100,
        shortDepositAmount: 100,
        aliasId: "digital",
        payoff: "digital",
        payoffData: { isCall: false },
        expiry: "monthly",
        underlying: "USDT/USD",
        imgPath: "/usdt-logo.png",
        rateId: "pyth",
        strike: 0.95
    }
 }];

export default Stories;

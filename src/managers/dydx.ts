// import { Solo } from "@dydxprotocol/solo";
import { ethers } from "ethers";

export default class Dydx {
    public async getRates() {
        const provider = ethers.getDefaultProvider();
        const networkId = 1;
        /*
        const solo = new Solo(
            provider,  // Valid web3 provider
            networkId, // Ethereum network ID (1 - Mainnet, 42 - Kovan, etc.)
        );

        const rate = await solo.getters.getEarningsRate();
        return rate;
        */
    }

    public async storeRates() {
        return false;
    }
}

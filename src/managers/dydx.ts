// import { Solo } from "@dydxprotocol/solo";
import { ethers } from "ethers";

export default class Dydx {
    public async getRates() {
        const provider = ethers.getDefaultProvider();
        const networkId = 1;
        return false;
        /*
        const solo = new Solo(
            provider,  // Valid web3 provider
            networkId, // Ethereum network ID (1 - Mainnet, 42 - Kovan, etc.)
        );

        return await solo.getters.getEarningsRate();
        */
    }
}

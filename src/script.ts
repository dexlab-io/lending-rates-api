import { ethers } from "ethers";

import Bzx from "./managers/bzx";
import Compound from "./managers/compound";
import Dydx from "./managers/dydx";

class Collector {
    public provider;
    public network;
    public blockNumber: number;

    private dydx: Dydx;
    private compound: Compound;
    private bzx: Bzx;

    public async setup() {
        global.console.log("Setting up data collector process...");

        this.provider = ethers.getDefaultProvider();
        this.network = await this.provider.getNetwork();

        this.dydx = new Dydx();
        this.compound = new Compound();
        this.bzx = new Bzx();
    }

    public async collectAllRates() {
        const blockNumber = await this.provider.getBlockNumber();

        global.console.log("The block number is now: " + blockNumber);

        if (this.blockNumber !== blockNumber) {
            this.blockNumber = blockNumber;

            this.collectAndStoreDydx();
            this.collectAndStoreCompound();
            this.collectAndStoreBzx();
        }
    }

    private collectAndStoreDydx() {
        global.console.log("Collecting and Storing Dydx data");
        this.dydx.getRates();
    }
    private collectAndStoreCompound() {
        global.console.log("Collecting and Storing Compound data");
        this.compound.getRates();
    }
    private collectAndStoreBzx() {
        global.console.log("Collecting and Storing Bzx data");
        this.bzx.getRates();
    }
}

(async () => {
    const collector = new Collector();
    await collector.setup();

    setInterval(() => collector.collectAllRates(), 5000);
})();

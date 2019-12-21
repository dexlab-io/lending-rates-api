import { ethers } from "ethers";

import Stock from './managers/Stock';
import Bzx from "./managers/bzx";
import Compound from "./managers/compound";
import Dydx from "./managers/dydx";

const H24: number = 86400000;
const H1: number = 3600000;
class Collector {
    public provider;
    public network;
    public blockNumber: number;

    private dydx: Dydx;
    private compound: Compound;
    private bzx: Bzx;
    private VTI: Stock;

    public async setup() {
        global.console.log("Setting up data collector process...");

        this.provider = ethers.getDefaultProvider();
        this.network = await this.provider.getNetwork();

        this.dydx = new Dydx();
        this.compound = new Compound();
        this.bzx = new Bzx();

        this.VTI = new Stock('VTI');
    }

    public async collectAllRates() {
        const blockNumber = await this.provider.getBlockNumber();

        global.console.log("The block number is now: " + blockNumber);

        if (this.blockNumber !== blockNumber) {
            this.blockNumber = blockNumber;

            this.collectAndStoreDydx();
            this.collectAndStoreCompound();
            this.collectAndStoreBzx();
            this.collectAndStoreStock(this.VTI);
        }
    }

    public async collectDailyPriceFeed() {

        global.console.log("The block number is now: ");
        this.collectAndStoreStock(this.VTI);
    }

    private async collectAndStoreStock(stock: Stock) {
        global.console.log(`Collecting and Storing Stock: ${stock.ticker} data`);
        const res = await stock.getRates();
        global.console.log(res);
        stock.storeRates(res);
    }

    private collectAndStoreDydx() {
        global.console.log("");
    }

    private async collectAndStoreCompound() {
        global.console.log("Collecting and Storing Compound data");
        this.compound.storeRates(this.blockNumber, await this.compound.getRates());
    }

    private async collectAndStoreBzx() {
        global.console.log("Collecting and Storing Bzx data");
        this.bzx.storeRates(this.blockNumber, await this.bzx.getRates());
    }
}

(async () => {
    const collector = new Collector();
    await collector.setup();

    setInterval(() => collector.collectAllRates(), 5000);
    setInterval(() => collector.collectDailyPriceFeed(), H1);
})();

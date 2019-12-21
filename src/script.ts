import { ethers } from "ethers";

import Stock from './managers/Stock';
import Bzx from "./managers/bzx";
import Compound from "./managers/compound";
import Dydx from "./managers/dydx";

const H24: number = 86400000;
const H1: number = 3600000;
const M5: number = 300000;
const S15: number = 15000;
class Collector {
    public provider;
    public network;
    public blockNumber: number;

    private dydx: Dydx;
    private compound: Compound;
    private bzx: Bzx;
    private VTI: Stock;
    private TLT: Stock;
    private IEI: Stock;
    private GLD: Stock;
    private GSG: Stock;

    public async setup() {
        global.console.log("Setting up data collector process...");

        this.provider = ethers.getDefaultProvider();
        this.network = await this.provider.getNetwork();

        this.dydx = new Dydx();
        this.compound = new Compound();
        this.bzx = new Bzx();

        this.VTI = new Stock('VTI');
        this.TLT = new Stock('TLT');
        this.IEI = new Stock('IEI');
        this.GLD = new Stock('GLD');
        this.GSG = new Stock('GSG');
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

    public async collectDailyPriceFeed() {
        global.console.log("--- ETF recording ---");
        await this.collectAndStoreStock(this.VTI);
        await this.collectAndStoreStock(this.TLT);
        await this.collectAndStoreStock(this.IEI);
        await this.collectAndStoreStock(this.GLD);
        await this.collectAndStoreStock(this.GSG);
    }

    private async collectAndStoreStock(stock: Stock) {
        global.console.log(`Collecting and Storing Stock: ${stock.ticker} data`);
        const res = await stock.getRatesDay();
        global.console.log(`Last checked: ${res.last_refreshed}`);
        global.console.table(res.data);
        await stock.storeRates(res);
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

    setInterval(() => collector.collectAllRates(), M5);
    collector.collectDailyPriceFeed()
    setInterval(() => collector.collectDailyPriceFeed(), M5);
})();

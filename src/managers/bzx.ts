import Config from "../config";

import { ethers } from "ethers";
import * as fs from "fs";
import Rates from "./rates";

export default class Bzx {
    public bzxTokenizedRegistryABI;
    public bzxITokenABI;
    public contractAddress;

    constructor() {
        this.contractAddress = Config.BZX_CONTRACT_ADDRESS;
        this.bzxTokenizedRegistryABI = JSON.parse(fs.readFileSync(Config.BZX_TRABI, "utf8"));
        this.bzxITokenABI = JSON.parse(fs.readFileSync(Config.BZX_ITABI, "utf8"));
    }

    public async getRates() {
        const provider = ethers.getDefaultProvider(Config.BZX_NETWORK);

        const bzxContract = new ethers.Contract(this.contractAddress, this.bzxTokenizedRegistryABI, provider);

        const tokens = await bzxContract.getTokens(0, 10000, 1);

        const rates = [];
        for (const token of tokens) {
            const tokenContract = new ethers.Contract(token.token, this.bzxITokenABI, provider);
            const r = await tokenContract.supplyInterestRate();
            let symbol = token.symbol;
            if (symbol.length === 4 && symbol.charAt(0) === "i") {
                symbol = symbol.substr(1);
            }
            rates.push({name: symbol, apr: r.toString()});
        }

        return rates;
    }

    public async storeRates(blockNumber: number, rates) {
        const r = new Rates();
        const store = await r.storeAll("Bzx", blockNumber, rates);
    }
}

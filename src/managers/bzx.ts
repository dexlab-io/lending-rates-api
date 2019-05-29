import { ethers } from "ethers";
import * as fs from "fs";

export default class Bzx {
    public bzxTokenizedRegistryABI;
    public bzxITokenABI;
    public contractAddress = "0xd3a04ec94b32dc4edbfc8d3be4cd44850e6df246";

    constructor() {
        this.bzxTokenizedRegistryABI = JSON.parse(fs.readFileSync("./contracts/bzxTokenizedRegistryABI.json", "utf8"));
        this.bzxITokenABI = JSON.parse(fs.readFileSync("./contracts/bzxITokenABI.json", "utf8"));
    }

    public async getRates() {
        const provider = ethers.getDefaultProvider("ropsten");

        const bzxContract = new ethers.Contract(this.contractAddress, this.bzxTokenizedRegistryABI, provider);

        const tokens = await bzxContract.getTokens(0, 10000, 1);

        const rates = [];
        for (const token of tokens) {
            const tokenContract = new ethers.Contract(token.token, this.bzxITokenABI, provider);
            const r = await tokenContract.supplyInterestRate();
            rates.push({name: token.symbol, apr: r});
        }

        global.console.log(rates);
    }
}

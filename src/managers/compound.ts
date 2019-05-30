import Config from "../config";

import { ethers } from "ethers";
import * as fs from "fs";
import { findIndex, isUndefined } from "lodash";
import sqlite from "../../src/managers/sqlite";

export default class Compound {
    public cERC20ABI;
    public tokens = [
        {   apr: "0",
            cTokenAddress: "0xf5dce57282a584d2746faf1593d3121fcac444dc",
            contractAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
            name: "DAI",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "DAI"},
        {   apr: "0",
            cTokenAddress: "0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407",
            contractAddress: "0xe41d2489571d322189246dafa5ebde1f4699f498",
            name: "ZRX",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "ZRX"},
        {   apr: "0",
            cTokenAddress: "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e",
            contractAddress: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
            name: "BAT",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "BAT" },
        {   apr: "0",
            cTokenAddress: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
            contractAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            name: "WETH",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "WETH"},
        {   apr: "0",
            cTokenAddress: "0x158079ee67fce2f58472a96584a73c7ab9ac95c1",
            contractAddress: "0x1985365e9f78359a9B6AD760e32412f4a445E862",
            name: "REP",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "REP"},
        {   apr: "0",
            cTokenAddress: "0x39aa39c021dfbae8fac545936693ac917d5e7563",
            contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            name: "USDC",
            supplyAmount: {},
            supplyRateMantissa: 0,
            symbol: "USDC"},
    ];

    constructor() {
        this.cERC20ABI = JSON.parse(fs.readFileSync(Config.COMPOUND_CERC20ABI, "utf8"));
    }

    public async getRates() {
        const rates = [];
        for (const token of this.tokens) {
            const tokenState = await this.getTokenState(token.name);
            rates.push({name: tokenState.name, apr: tokenState.apr});
        }

        return rates;
    }

    public async getTokenState(tokenName: string) {
        const idx = this.getTokenIndex(tokenName);
        this.tokens[idx].supplyRateMantissa = await this.getMarketInfo(tokenName);
        this.tokens[idx].apr = this.calculateApr(this.tokens[idx].supplyRateMantissa);
        return this.tokens[idx];
    }

    public async getMarketInfo(tokenName: string): Promise<number> {
        const idx = this.getTokenIndex(tokenName);
        const cToken = new ethers.Contract( this.tokens[idx].cTokenAddress,
                                            this.cERC20ABI,
                                            ethers.getDefaultProvider());
        const supplyRate = (await cToken.supplyRatePerBlock()) / 1e18;
        return supplyRate;
    }

    public async storeRates(blockNumber: number, rates) {
        const db = new sqlite();
        const store = await db.storeAllRates("Compound", blockNumber, rates);
    }

    private getTokenIndex(tokenName: string): number {
        const idx = findIndex(this.tokens, (o) => {
            return o.name.toString().toLowerCase().trim()
                    === tokenName.toString().toLowerCase().trim();
        });

        if (idx < 0) {
            throw new Error("Token info not found!");
        }

        return idx;
    }

    private calculateApr(rateMantissa: number): string {
        const expRate = rateMantissa * 1e18;
        const BLOCKS_PER_YEAR = 2102400;
        const APR = ((expRate * BLOCKS_PER_YEAR) / 1e18) * 100;
        return APR.toFixed(2);
    }
}

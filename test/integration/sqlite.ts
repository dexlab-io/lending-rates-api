import { assert } from "chai";
import sqlite from "../../src/managers/sqlite";

describe("SQLite DB", () => {
    it("It store and reads a Rate", async () => {
        const db = new sqlite();

        const blockNumber = 123;
        const provider = "Example";
        const rate = 12.5;

        const store = await db.storeRate(provider, blockNumber, rate);

        const storedData = await db.getRate(provider, blockNumber);

        assert.deepEqual(storedData, {blockNumber, provider, rate});
    });
});

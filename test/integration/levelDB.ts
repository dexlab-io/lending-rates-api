import { assert } from "chai";
import levelDB from "../../src/managers/levelDB";

describe("Level DB", () => {
    it("It stores and gets a Rate", async () => {
        const level = new levelDB();

        const blockNumber = 123;
        const provider = "Example";
        const data = {provider: {provider}, blockNumber: {blockNumber}, rate: 12.5};

        await level.storeRate(provider, blockNumber, data);

        const storedData = await level.getRate(provider, blockNumber);

        assert.deepEqual(data, storedData);
    });
});

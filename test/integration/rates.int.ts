import { assert } from "chai";
import Rates from "../../src/managers/rates";

describe("Rates", () => {
    it("It store and reads a Rate", async () => {
        const rates = new Rates();

        const blockNumber = 123;
        const provider = "example";
        const rate = "12.5";
        const token = "dai";

        const store = await rates.store(provider, token, blockNumber, rate);

        const storedData = await rates.get(provider, token, blockNumber);

        assert.deepEqual(storedData, {blockNumber, provider, rate, token});
    });
});

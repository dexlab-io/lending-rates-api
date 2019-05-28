import { assert } from "chai";
import Compound from "../../src/managers/compound";

describe("Compound protocol", () => {
    it("It gets the actual rates", async () => {
        const compound = new Compound();
        assert.isNotEmpty(await compound.getRates());
    }).timeout(15000);
});

import { assert } from "chai";
import Bzx from "../../src/managers/bzx";

describe("Bzx protocol", () => {
    it("It gets the actual rates", async () => {
        const bzx = new Bzx();
        assert.isNotEmpty(await bzx.getRates());
    }).timeout(15000);
});

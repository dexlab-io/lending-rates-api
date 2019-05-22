import { assert } from "chai";
import Dydx from "../../src/managers/dydx";

describe("Dydx protocol", () => {
    it("It gets the actual rates", async () => {
        const dydx = new Dydx();
        assert.isNotEmpty(dydx.getRates());
    });
});

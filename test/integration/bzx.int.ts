import { assert } from "chai";
import Bzx from "../../src/managers/bzx";

describe("Bzx protocol", () => {
    it("It gets the actual rates", async () => {
        const bzx = new Bzx();
        await bzx.getRates();
        global.console.log("DONE");
    }).timeout(15000);
});

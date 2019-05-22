import { assert } from "chai";
import { ethers } from "ethers";

describe("Ethereum Blockchain connection", () => {
    it("Connects to Ethereum blockchain and gets the block number", async () => {
        const provider = ethers.getDefaultProvider();

        const network = await provider.getNetwork();
        assert.isNotEmpty(network);

        const blockNumber = await provider.getBlockNumber();
        assert.isNumber(blockNumber);
    });
});

import * as sqlite from "sqlite";
import Config from "../config";

export default class Sqlite {
    public async storeAllRates(provider: string, blockNumber: number, rates) {
        for (const r of rates) {
            this.storeRate(provider, r.name, blockNumber, r.apr);
        }
    }

    public async storeRate(provider: string, token: string, blockNumber: number, rate: number) {
        const db = await sqlite.open(Config.DBPATH);

        await db.run("CREATE TABLE IF NOT EXISTS rates (provider text, token text, blockNumber integer, rate real)");

        const sql = "INSERT INTO rates (provider, token, blockNumber, rate) VALUES (?,?,?,?)";
        const params = [provider, token, blockNumber, rate];
        const ret = await db.run(sql, params);

        db.close();

        return ret;
    }

    public async getRate(provider: string, tokenName: string, blockNumber: number) {
        const db = await sqlite.open(Config.DBPATH);

        const sql = "SELECT * FROM rates WHERE provider = ? AND blockNumber = ? AND token = ?";
        const data = await db.get(sql, provider, blockNumber, tokenName);

        db.close();

        return data;
    }

}

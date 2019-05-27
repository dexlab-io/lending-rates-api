import * as sqlite from "sqlite";
import Config from "../config";

export default class Sqlite {
    public async storeRate(provider: string, blockNumber: number, rate: number) {
        const db = await sqlite.open(Config.DBPATH);

        await db.run("CREATE TABLE IF NOT EXISTS rates (provider text, blockNumber integer, rate real)");

        const sql = "INSERT INTO rates (provider, blockNumber, rate) VALUES (?,?,?)";
        const params = [provider, blockNumber, rate];
        const ret = await db.run(sql, params);

        db.close();

        return ret;
    }

    public async getRate(provider: string, blockNumber: number) {
        const db = await sqlite.open(Config.DBPATH);

        const sql = "SELECT * FROM rates WHERE provider = ? AND blockNumber = ?";
        const data = await db.get(sql, provider, blockNumber);

        db.close();

        return data;
    }

}

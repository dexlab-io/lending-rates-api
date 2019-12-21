import * as sqlite from "sqlite";
import Config from "../config";

export default class Prices {

    public async store(provider: string, ticker: string, timestamp: string, price: number, open: number, high: number, low: number, close: number, volume: number) {
        const db = await sqlite.open(Config.DBPATH);

        let sql = `CREATE TABLE IF NOT EXISTS
                    prices (id INTEGER NOT NULL PRIMARY KEY, provider text, ticker text, timestamp text, price real, open real, high real, low real, close real, volume integer)`;
        await db.run(sql);

        sql = "INSERT INTO prices (provider, ticker, timestamp, price, open, high, low, close, volume) VALUES (?,?,?,?,?,?,?,?,?)";
        const params = [provider.toLowerCase(), ticker, timestamp, price, open, high, low, close, volume];
        const ret = await db.run(sql, params);

        db.close();

        return ret;
    }

    public async get(ticker: string) {
        const db = await sqlite.open(Config.DBPATH);

        const sql = "SELECT * FROM prices WHERE ticker=(?) ORDER BY id DESC;";
        const data = await db.get(sql, ticker);
        db.close();

        return data;
    }

    public async getLast(ticker?: string) {
        const db = await sqlite.open(Config.DBPATH);

        let sql = "SELECT * FROM prices";
        if (ticker) {

            if (ticker) {
                sql += " WHERE ticker = (?)";
            }
        }

        sql += " ORDER BY id DESC LIMIT 1";
        const data = await db.all(sql, ticker);

        db.close();

        return data[0];
    }

}

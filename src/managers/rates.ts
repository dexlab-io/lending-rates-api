import * as sqlite from "sqlite";
import Config from "../config";

export default class Rates {
    public async storeAll(provider: string, blockNumber: number, rates) {
        for (const r of rates) {
            this.store(provider, r.name, blockNumber, r.type, r.apr);
        }
    }

    public async store(provider: string, token: string, blockNumber: number, type: string, rate: string) {
        const db = await sqlite.open(Config.DBPATH);

        let sql = `CREATE TABLE IF NOT EXISTS
                    rates (id INTEGER NOT NULL PRIMARY KEY, provider text, token text, blockNumber integer, type text, rate text)`;
        await db.run(sql);

        sql = "INSERT INTO rates (provider, token, blockNumber, type, rate) VALUES (?,?,?,?,?)";
        const params = [provider.toLowerCase(), token.toLowerCase(), blockNumber, type, rate];
        const ret = await db.run(sql, params);

        db.close();

        return ret;
    }

    public async get(provider: string, tokenName: string, blockNumber: number) {
        const db = await sqlite.open(Config.DBPATH);

        const sql = "SELECT * FROM rates WHERE lower(provider)=lower(?) AND lower(token)=lower(?) AND blockNumber=?";
        const data = await db.get(sql, provider, tokenName, blockNumber);
        db.close();

        return data;
    }

    public async getLast(tokenName?: string, provider?: string) {
        const db = await sqlite.open(Config.DBPATH);

        let sql = "SELECT provider, token, max(blockNumber), type, rate FROM rates";
        if (tokenName || provider) {
            sql += " WHERE 1=1";

            if (tokenName) {
                sql += " AND lower(token) = lower(?)";
            }
            if (provider) {
                sql += " AND lower(provider) = lower(?)";
            }
        }

        sql += " GROUP BY provider, token, type";
        const data = await db.all(sql, tokenName, provider);

        db.close();

        return data;
    }

}

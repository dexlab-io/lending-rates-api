import * as sqlite from "sqlite";
import Config from "../config";

export default class Rates {
    public async storeAll(provider: string, blockNumber: number, rates) {
        for (const r of rates) {
            this.store(provider, r.name, blockNumber, r.apr);
        }
    }

    public async store(provider: string, token: string, blockNumber: number, rate: string) {
        const db = await sqlite.open(Config.DBPATH);

        await db.run("CREATE TABLE IF NOT EXISTS rates (provider text, token text, blockNumber integer, rate text)");

        const sql = "INSERT INTO rates (provider, token, blockNumber, rate) VALUES (?,?,?,?)";
        const params = [provider.toLowerCase(), token.toLowerCase(), blockNumber, rate];
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

        let sql = "SELECT provider, token, max(blockNumber), rate FROM rates";
        if (tokenName || provider) {
            sql += " WHERE 1=1";

            if (tokenName) {
                sql += " AND lower(token) = lower(?)";
            }
            if (provider) {
                sql += " AND lower(provider) = lower(?)";
            }
        }

        sql += " GROUP BY provider, token";
        const data = await db.all(sql, tokenName, provider);

        db.close();

        return data;
    }

}

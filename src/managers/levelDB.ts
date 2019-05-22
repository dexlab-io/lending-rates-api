import * as Level from "level";
import Config from "../config";

export default class LevelDB {
    public async storeRate(provider: string, blockNumber: number, data) {
        const db = Level(Config.DBPATH);
        const key = provider + blockNumber;

        try {
            await db.put(key, JSON.stringify(data));
        } catch (err) {
            global.console.log(err);
        }

        db.close();

        return true;
    }

    public async getRate(provider: string, blockNumber: number) {
        const db = Level(Config.DBPATH);
        const key = provider + blockNumber;

        let data;
        try {
            data = await db.get(key);
        } catch (err) {
            global.console.log(err);
        }

        db.close();

        return JSON.parse(data);
    }
}

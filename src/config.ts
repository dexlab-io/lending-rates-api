import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

let customConfig;
const defaultConfig = dotenv.parse(readFileSync(resolve(__dirname, "..", ".env")));

switch (process.env.NODE_ENV) {
    case "test":
        customConfig = dotenv.parse(readFileSync(resolve(__dirname, "..", ".env.test")));
        break;
    case "production":
        customConfig = dotenv.parse(readFileSync(resolve(__dirname, "..", ".env.production")));
        break;
    default:
        customConfig = dotenv.parse(readFileSync(resolve(__dirname, "..", ".env.development")));
}

export default Object.assign(defaultConfig, customConfig, process.env);

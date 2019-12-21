import config from "./config";

import * as HttpStatus from "http-status-codes";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";

import ratesController from "./controllers/rates";
import stockController from "./controllers/stock";

const PORT: number = Number(config.PORT);
const app = new Koa();

app.use(bodyParser());

app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
        if (config.DEBUG) {
            global.console.log(ctx.method, ctx.url);
        }
        await next();
    } catch (error) {
        ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        error.status = ctx.status;
        ctx.body = { error };
        ctx.app.emit("error", error, ctx);
    }
});

app.use(ratesController.routes());
app.use(ratesController.allowedMethods());
app.use(stockController.routes());
app.use(stockController.allowedMethods());


app.on("error", global.console.error);

app.listen(PORT, () => {
    global.console.log("Server listening on port", PORT);
});

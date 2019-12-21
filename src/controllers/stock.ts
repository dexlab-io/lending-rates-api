import * as Koa from "koa";
import * as Router from "koa-router";

import Prices from "../managers/Prices";
import Stock from "../managers/Stock";

const routerOpts: Router.IRouterOptions = {
    prefix: "/stock",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
    const rates = new Prices();
    ctx.body = await rates.getLast();
});

router.get("/:token", async (ctx: Koa.Context) => {
    const rates = new Prices();
    ctx.body = await rates.getLast(ctx.params.token);
});

router.get("/:token/daily", async (ctx: Koa.Context) => {
    const rates = new Prices();
    ctx.body = await rates.getLast(ctx.params.token);
});

router.get("/:token/monthly", async (ctx: Koa.Context) => {
    const rates = new Stock(ctx.params.token);
    ctx.body = await rates.getRates('MONTHLY');
});


router.get("/:token/weekly", async (ctx: Koa.Context) => {
    const rates = new Stock(ctx.params.token);
    ctx.body = await rates.getRates('WEEKLY');
});

export default router;

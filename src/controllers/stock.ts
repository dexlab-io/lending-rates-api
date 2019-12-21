import * as Koa from "koa";
import * as Router from "koa-router";

import Prices from "../managers/Prices";

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

export default router;

import * as Koa from "koa";
import * as Router from "koa-router";

import Rates from "../managers/rates";

const routerOpts: Router.IRouterOptions = {
    prefix: "/rates",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
    const rates = new Rates();
    ctx.body = await rates.getLast();
});

router.get("/:token", async (ctx: Koa.Context) => {
    const rates = new Rates();
    ctx.body = await rates.getLast(ctx.params.token);
});

router.get("/:token/:provider", async (ctx: Koa.Context) => {
    const rates = new Rates();
    ctx.body = await rates.getLast(ctx.params.token, ctx.params.provider);
});

export default router;

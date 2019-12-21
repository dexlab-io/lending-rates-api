

import * as Koa from "koa";
import * as Router from "koa-router";
import Charts from "../managers/Charts";

const routerOpts: Router.IRouterOptions = {
    prefix: "/charts",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
    const chart = new Charts();
    ctx.body = await chart.main();
});

router.get("/compound", async (ctx: Koa.Context) => {
    const chart = new Charts();
    ctx.body = await chart.getCompoundData();
});

export default router;

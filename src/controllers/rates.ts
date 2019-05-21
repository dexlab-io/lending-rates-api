import * as Koa from "koa";
import * as Router from "koa-router";

const routerOpts: Router.IRouterOptions = {
    prefix: "/rates",
};
const router: Router = new Router(routerOpts);

router.get("/hi", async (ctx: Koa.Context) => {
    ctx.body = "Hi there!!!";
});

router.get("/dydx", async (ctx: Koa.Context) => {
    ctx.body = "DYDX stored rates!!!";
});

export default router;

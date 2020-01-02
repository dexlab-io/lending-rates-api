import * as Koa from "koa";
import * as Router from "koa-router";

import Portfolio from "../managers/Portfolio";
import Stock from "../managers/Stock";

const routerOpts: Router.IRouterOptions = {
    prefix: "/portfolio",
};
const router: Router = new Router(routerOpts);

router.get("/awp", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.5, asset: new Stock('VTI') }, 
        { ratio: 0.5, asset: new Stock('IEI') }, 
    ]);
    ctx.body = await awp.getState();
});

router.get("/test", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.5, asset: new Stock('VTI') }, 
        { ratio: 0.5, asset: new Stock('IEI') }, 
    ]);
    ctx.body = await awp.test();
});

export default router;

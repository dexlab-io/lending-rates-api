import * as Koa from "koa";
import * as Router from "koa-router";

import Portfolio from "../managers/Portfolio";
import Stock from "../managers/Stock";
import Crypto from "../managers/Crypto";

const routerOpts: Router.IRouterOptions = {
    prefix: "/portfolio",
};
const router: Router = new Router(routerOpts);

router.get("/awp", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.3, asset: new Stock('VTI') }, 
        { ratio: 0.4, asset: new Stock('TLT') }, 
        { ratio: 0.15, asset: new Stock('IEI') }, 
        { ratio: 0.075, asset: new Stock('GLD') }, 
        { ratio: 0.075, asset: new Stock('GSG') }, 
    ]);
    ctx.body = await awp.getState();
});

router.get("/awp++", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.27, asset: new Stock('VTI') }, 
        { ratio: 0.36, asset: new Stock('TLT') }, 
        { ratio: 0.135, asset: new Stock('IEI') }, 
        { ratio: 0.0675, asset: new Stock('GLD') }, 
        { ratio: 0.0675, asset: new Stock('GSG') }, 
        { ratio: 0.05, asset: new Crypto('BTC') }, 
        { ratio: 0.05, asset: new Crypto('ETH') }, 
    ]);
    ctx.body = await awp.getState();
});

router.get("/test", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.3, asset: new Stock('VTI') }, 
        { ratio: 0.5, asset: new Stock('IEI') }, 
    ]);
    ctx.body = await awp.test();
});

router.get("/test_btc", async (ctx: Koa.Context) => {
    const awp = new Portfolio([
        { ratio: 0.3, asset: new Crypto('BTC') }, 
        { ratio: 0.5, asset: new Stock('IEI') }, 
    ]);
    ctx.body = await awp.test('2019-01-31');
});

export default router;

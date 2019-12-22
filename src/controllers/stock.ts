import * as Koa from "koa";
import * as Router from "koa-router";

import Prices from "../managers/Prices";
import Stock from "../managers/Stock";

const toChart = (data, ticker) => {
    const flat = [];
    //@ts-ignore
    data.forEach(val => {
        try {
            const complex = Object.entries(val);
            const key = complex[0][0];
            let t = key.split('-')
            if( parseInt(t[0]) <= 2017){
                return;
            }
            const formatted_date = `${t[1]}`;
            const obj = complex[0][1];
            //@ts-ignore
            flat.push( {ticker, date: formatted_date, date_full: key, price: obj.close} )
        } catch (e) {}
    });
    return flat;
}

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

router.get("/:token/monthly/chart", async (ctx: Koa.Context) => {
    const rates = new Stock(ctx.params.token);
    const res = await rates.getRates('MONTHLY');
    const flat = toChart(res.data, ctx.params.token);
    ctx.body = flat;
});

router.get("/:token/weekly", async (ctx: Koa.Context) => {
    const rates = new Stock(ctx.params.token);
    ctx.body = await rates.getRates('WEEKLY');
});

export default router;

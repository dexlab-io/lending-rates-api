import * as Koa from "koa";
import * as Router from "koa-router";

import Prices from "../managers/Prices";
import Crypto from "../managers/Crypto";

const routerOpts: Router.IRouterOptions = {
    prefix: "/crypto",
};
const router: Router = new Router(routerOpts);

router.get("/:token/daily", async (ctx: Koa.Context) => {
    const rates = new Crypto(ctx.params.token);
    ctx.body = await rates.getRates();
});

router.get("/:token/monthly", async (ctx: Koa.Context) => {
    const rates = new Crypto(ctx.params.token);
    ctx.body = await rates.getRates('MONTHLY');
});

router.get("/:token/monthly/chart", async (ctx: Koa.Context) => {
    const rates = new Crypto(ctx.params.token);
    const res = await rates.getRates('MONTHLY');
    const flat = toChart(res, ctx.params.token);
    ctx.body = flat;
});

router.get("/:token/weekly", async (ctx: Koa.Context) => {
    const rates = new Crypto(ctx.params.token);
    ctx.body = await rates.getRates('WEEKLY');
});

const toChart = (data, ticker) => {
    return data;
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

export default router;

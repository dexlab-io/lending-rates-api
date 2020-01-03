

import * as Koa from "koa";
import * as Router from "koa-router";
import * as moment from 'moment';
import Charts from "../managers/Charts";
import Portfolio from "../managers/Portfolio";
import Stock from "../managers/Stock";
import Crypto from "../managers/Crypto";

const routerOpts: Router.IRouterOptions = {
    prefix: "/charts",
};
const router: Router = new Router(routerOpts);

router.get("/", async (ctx: Koa.Context) => {
    const chart = new Charts();
    ctx.body = await chart.main();
});


router.get("/comparison", async (ctx: Koa.Context) => {
    const chart = new Charts();
    const compound = await chart.getCompoundData();

    const awp = new Portfolio([
        { ratio: 0.3, asset: new Stock('VTI') }, 
        { ratio: 0.4, asset: new Stock('TLT') }, 
        { ratio: 0.15, asset: new Stock('IEI') }, 
        { ratio: 0.075, asset: new Stock('GLD') }, 
        { ratio: 0.075, asset: new Stock('GSG') }, 
    ]);

    const awpPlusPlus = new Portfolio([
        { ratio: 0.27, asset: new Stock('VTI') }, 
        { ratio: 0.36, asset: new Stock('TLT') }, 
        { ratio: 0.135, asset: new Stock('IEI') }, 
        { ratio: 0.0675, asset: new Stock('GLD') }, 
        { ratio: 0.0675, asset: new Stock('GSG') }, 
        { ratio: 0.035, asset: new Crypto('BTC') }, 
        { ratio: 0.035, asset: new Crypto('ETH') },

        { ratio: 0.003333, asset: new Crypto('LINK') }, 
        { ratio: 0.003333, asset: new Crypto('MKR') }, 
        { ratio: 0.003333, asset: new Crypto('ZRX') }, 
        { ratio: 0.003333, asset: new Crypto('SNX') }, 
        { ratio: 0.003333, asset: new Crypto('REN') }, 
        { ratio: 0.003333, asset: new Crypto('LRC') }, 
        { ratio: 0.003333, asset: new Crypto('KNC') }, 
        { ratio: 0.003333, asset: new Crypto('BNT') }, 
        { ratio: 0.003333, asset: new Crypto('MLN') }, 
    ]);

    const awpRes = await awp.getState();
    const awpPlusPlusRes = await awpPlusPlus.getState();
    
    const momPlus = awpPlusPlusRes.MoM.map(o => { return {
        awpPlus: o.roi_percentage_since_start * 100,
        month: moment(o.month).format('MMMM-YY'),
        date: moment(o.month).format('YYYY-MM-DD'),
    }});

    const mom = awpRes.MoM.map(o => { return {
        awp: o.roi_percentage_since_start * 100,
        month: moment(o.month).format('MMMM-YY'),
        date: moment(o.month).format('YYYY-MM-DD'),
    }});

    const merged = [
        ...mom.concat(momPlus).concat(compound).reduce((m, o) => 
            m.set(o.month, Object.assign(m.get(o.month) || {}, o)), new Map()
        ).values()
    ];

    const onlyMerged = merged.filter( m => {
        return moment(m.date).isSameOrAfter( moment(m.date).set('date', 29) )
    });

    ctx.body = onlyMerged;
});

router.get("/compound", async (ctx: Koa.Context) => {
    const chart = new Charts();
    ctx.body = await chart.getCompoundData();
});

router.get("/etf", async (ctx: Koa.Context) => {
    const chart = new Charts();
    ctx.body = await chart.getEtfData();
});



export default router;

import * as moment from 'moment';
import * as _ from "lodash";
import Stock from './Stock';
import Crypto from './Crypto';
import { Candle } from '../interfaces';

const createCandle = t => { return {
    open: parseFloat(t.open),
    high: parseFloat(t.high),
    low: parseFloat(t.low),
    close: parseFloat(t.close),
    volume: parseFloat(t.volume)
}};

const DEFAULT_CANDLE_VAL = "open";
type AssetType = Stock | Crypto;

interface AssetsConfig {
    ratio: number,
    asset: AssetType
}

interface SingleAssetConfig {
    aum: number,
    asset: AssetType
}

class Asset {
    asset: AssetType;
    aum: number;
    amount: number;
    ticker: string;
    _cache: object;

    constructor(assetConf: SingleAssetConfig) {
        this.asset = assetConf.asset;
        this.aum = assetConf.aum;
        this.ticker = this.asset.ticker;
        this._cache = {
            MONTHLY: null,
            ROI: null
        };
    }

    amountAtCandle(candle: Candle) {
        return  this.aum / candle[DEFAULT_CANDLE_VAL];
    }

    async calcROI(since: string = '2019-01-31') {
        const data = await this.pullHistorical();        
        const filtered = [];

        // @ts-ignore
        _.forEach(data.reverse(), (value, key) => { 
            let t = Object.entries(value);
            let datetime = t[0][0];
            let v = t[0][1];
            
            if( moment(datetime).isSame( moment(since) ) ) {
                this.amount = this.amountAtCandle( createCandle(v) );    
            }

            const price = createCandle(v)[DEFAULT_CANDLE_VAL];
            const usdVal = this.amount * price;
            value[datetime].price = price;
            value[datetime].amountBroken = this.amount;
            value[datetime].amountPossible = this.aum / price;
            value[datetime].usdVal = usdVal;
            value[datetime].roi_mom = (usdVal - this.aum) / this.aum;

            if( moment(datetime).isSameOrAfter( moment(since) ) ) {
                filtered.push(value);
            }
        });

        this._cache['MONTHLY'] = data;

        const last = _.last(filtered);
        const first = _.head(filtered);

        if( first && last) {
            const t = Object.entries(first);
            const t1 = Object.entries(last);
            const k = t[0][0];
            const k1 = t1[0][0];
            const roi = last[k1].usdVal - first[k].usdVal;
            const summary = {
                aum: this.aum,
                roi,
                roi_percentage: (last[k1].usdVal - this.aum) / this.aum,
                ticker: this.ticker,
                data: filtered
            };
    
            this._cache['ROI'] = summary;
            return summary;
        } else {
            console.log('data', data)
            console.log('filtered', filtered)
            console.log('this', this)
            return {
                aum: this.aum,
                roi: 0,
                roi_percentage: 0,
                ticker: this.ticker,
                data: filtered
            };
        }
    }

    async pullHistorical() {
        if(this._cache['MONTHLY']) {
            return this._cache['MONTHLY'];
        }

        const res = await this.asset.getRates(this.asset.type === 'crypto' ? 'DAILY' : 'MONTHLY');
        this._cache['MONTHLY'] = res.data;
        return res.data;
    }
}

export default class Portfolio {
    capitalStart: number;
    capitalEnd: number;
    roi: number;
    roi_percentage: number;
    MoM: any;
    assetsConfig: AssetsConfig[];
    assets: Asset[];

    constructor( assets: AssetsConfig[]) {
        this.capitalStart = 10000;
        this.capitalEnd = 10000;
        this.assetsConfig = assets;
        this.assets = assets.map(o => new Asset({ 
            aum: (this.capitalStart * o.ratio), 
            asset: o.asset
        }));
    }

    async getSingleAsset(ticker: string) {
        return _.find(this.assets, (o) => o.asset.ticker === ticker);
    }

    calculateMoM(priceFeeds) {
        const filtered = [];
        const months = _.map(priceFeeds[0].data, o => _.first(_.keysIn(o)));

        // @ts-ignore
        _.forEach(months, (month, key) => { 
            const temp = {month, assets: []};
            _.forEach(priceFeeds, (singlePriceFeed, key) => { 
                let flatObj = {};

                /**
                 * This loop creates a flat: 
                 * {
                 *  [datetime]: candle
                 * }
                 */
                _.forEach(singlePriceFeed.data, o => {
                    const t = _.first(_.keysIn(o));
                    flatObj[t] = o[t];
                });

                const historicalData = _.get(flatObj, month, {
                    usdVal: 0,
                    roi_mom: 0
                });

                temp.assets.push({
                    ticker: singlePriceFeed.ticker,
                    usdVal: historicalData.usdVal,
                    roi_mom: historicalData.roi_mom,
                    price: historicalData.price
                })
            });

            filtered.push(temp)
        });

        _.forEach(filtered, (o, k) => {
            o.usdValue = _.reduce(o.assets, function(result, value, key) {
                return value.usdVal + result;
            }, 0);

            o.roi_percentage_since_start = (o.usdValue - this.capitalStart) / this.capitalStart;

            if(k === 0) {
                o.roi_since_last_month = (o.usdValue - this.capitalStart) / this.capitalStart;
            } else {
                o.roi_since_last_month = (o.usdValue - filtered[k-1].usdValue) / filtered[k-1].usdValue;
            } 
        });

        this.MoM = filtered;
        return filtered;
    }

    async test(since: string = '2019-01-31') {
        const values = await Promise.all( this.assets.map(o => o.calcROI(since) ));
        this.calculateMoM(values);
        return values;
    }

    
    async sync(since: string = '2019-01-31') {
        const values = await Promise.all( this.assets.map(o => o.calcROI(since) ));
    
        this.roi = _.reduce(values, function(result, value, key) {
            return value.roi + result;
        }, 0);

        this.calculateMoM(values)

        this.capitalEnd = this.capitalStart + this.roi;
        this.roi_percentage = (this.capitalEnd - this.capitalStart) / this.capitalStart;
        
        return this;
    }

    async getState() {
        await this.sync();

        return {
            capitalStart: this.capitalStart,
            capitalEnd: this.capitalEnd,
            roi: this.roi,
            roi_percentage: this.roi_percentage,
            MoM: this.MoM,
            assets: this.assetsConfig.map( o => { return {
                ratio: o.ratio,
                ticker: o.asset.ticker,
                initial_allocation: (this.capitalStart * o.ratio),
            }})
        }
    }

}
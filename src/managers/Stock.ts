import * as moment from 'moment';
import axios from 'axios';
import Prices from "./Prices";
import Config from "../config";
import {Candle} from '../interfaces';
import {AssetModel} from '../models/Asset';

interface StockApiResponseSimple {
    symbol: string;
    last_refreshed: string;
    data: Candle;
}

interface HistoricalData {
    [key: string]: Candle
}
interface StockApiResponseMulti  {
    symbol: string;
    last_refreshed: string;
    data: HistoricalData[]
}

type GetRateReturn = StockApiResponseSimple | StockApiResponseMulti;

enum Timeframe {
    DAILY = 'TIME_SERIES_DAILY',
    WEEKLY = 'TIME_SERIES_WEEKLY',
    MONTHLY = 'TIME_SERIES_MONTHLY'
}

const JsonKeys = {
    DAILY: 'Time Series (Daily)',
    WEEKLY: 'Weekly Time Series',
    MONTHLY: 'Monthly Time Series',
}

export default class Stock {
    /**
     * Docs: https://www.alphavantage.co/documentation/
     */
    BaseUrl: string = "https://www.alphavantage.co/query?";

    public type: string = 'stock';
    public ticker: string;
    private API_KEY: string;

    constructor(ticker: string) {
        this.ticker = ticker
        this.API_KEY = Config.ALPHA_ADVANTAGE_APIKEY;
    }

    public async getRates(timeframe: string = 'DAILY'): Promise<GetRateReturn> {

        const dbres = await AssetModel.findOne({ symbol: this.ticker });

        console.log('-----' + this.ticker + '---------', dbres.data.length)
        if( dbres && dbres.data.length > 0 ) {
            const now = moment().startOf('day').utcOffset('00:00');
            console.log('now', now.format())
            console.log('other', moment( dbres.last_refreshed ).format())
            if( moment( dbres.last_refreshed ).isSameOrAfter( now ) ) {
                console.log('cached')
                return dbres;
            }
        }
        

        console.log('Fetching new data...', this.ticker);

        const res = await axios.get(`${this.BaseUrl}function=${Timeframe[timeframe]}&symbol=${this.ticker}&apikey=${this.API_KEY}`)
        console.log(`${this.BaseUrl}function=${Timeframe[timeframe]}&symbol=${this.ticker}&apikey=${this.API_KEY}`)
        
        const flat_data: HistoricalData[] = Object.entries(res.data[JsonKeys[timeframe]]).map(([key, val]) => {
            return {
                [key] : {
                    open: val['1. open'],
                    high: val['2. high'],
                    low: val['3. low'],
                    close: val['4. close'],
                    volume: val['5. volume'],
                }
            }
        });
        
        const flat_obj: StockApiResponseMulti = {
            symbol: res.data['Meta Data']['2. Symbol'],
            last_refreshed: moment(res.data['Meta Data']['3. Last Refreshed']).utcOffset('00:00').format(),
            data: flat_data
        }

        if( dbres ) {
            await AssetModel.findOneAndUpdate({ symbol: flat_obj.symbol }, flat_obj);
        } else {
            await AssetModel.findOneOrCreate({ symbol: flat_obj.symbol }, flat_obj);
        }

        console.log('saved on db', flat_obj.last_refreshed)
        return flat_obj;
    }

    public async getRatesDay() {
        const res = await this.getRates();
        const last_refreshed = Object.entries(res.data[0])[0][0];
        
        const flat_obj: StockApiResponseSimple = {
            ...res,
            data: res.data[0][last_refreshed]
        };

        return flat_obj;
    }


    /**
     * This function will save the values into the database.
     */
    public async storeRates(data: StockApiResponseSimple) {
        const prices = new Prices();
        const store = await prices.store('alphavantage', data.symbol, data.last_refreshed, 0, data.data.open, data.data.high, data.data.low, data.data.close, data.data.volume);
    }
}

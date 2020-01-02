import axios from 'axios';
import Prices from "./Prices";
import Config from "../config";
import {Candle} from '../interfaces';

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
        const res = await axios.get(`${this.BaseUrl}function=${Timeframe[timeframe]}&symbol=${this.ticker}&apikey=${this.API_KEY}`)
        
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
            last_refreshed: res.data['Meta Data']['3. Last Refreshed'],
            data: flat_data
        }
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

import axios from 'axios';
import Prices from "./Prices";
import Config from "../config";

interface Daily {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface StockApiResponseSimple {
    symbol: string;
    last_refreshed: string;
    data: Daily;
}

interface HistoricalData {
    [key: string]: Daily
}
interface StockApiResponseMulti  {
    symbol: string;
    last_refreshed: string;
    data: HistoricalData[]
}

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
    BaseUrl: string = "https://www.alphavantage.co/query?";

    public ticker: string;
    private API_KEY: string;

    constructor(ticker: string) {
        this.ticker = ticker
        this.API_KEY = Config.ALPHA_ADVANTAGE_APIKEY;
    }

    public async getRates(timeframe: string = 'DAILY') {
        const res = await axios.get(`${this.BaseUrl}function=${Timeframe[timeframe]}&symbol=${this.ticker}&apikey=${this.API_KEY}`)
        const temp = res.data[JsonKeys[timeframe]][ res.data['Meta Data']['3. Last Refreshed'] ];
        
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

        const daily: Daily = {
            open: temp['1. open'],
            high: temp['2. high'],
            low: temp['3. low'],
            close: temp['4. close'],
            volume: temp['5. volume'],
        }

        if(timeframe === 'DAILY') {
            const flat_obj: StockApiResponseSimple = {
                symbol: res.data['Meta Data']['2. Symbol'],
                last_refreshed: res.data['Meta Data']['3. Last Refreshed'],
                data: daily
            }
            return flat_obj;
        }
        
        const flat_obj: StockApiResponseMulti = {
            symbol: res.data['Meta Data']['2. Symbol'],
            last_refreshed: res.data['Meta Data']['3. Last Refreshed'],
            data: flat_data
        }
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

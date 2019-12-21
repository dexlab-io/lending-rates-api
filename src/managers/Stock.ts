import Prices from "./Prices";
import axios from 'axios';

interface Daily {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface StockApiResponse {
    symbol: string;
    last_refreshed: string;
    daily: Daily;
}

export default class Stock {
    BaseUrl: string = "https://www.alphavantage.co/query?";

    public ticker: string;
    private API_KEY: string = "S25O85Q00K8DOBYJ";

    constructor(ticker: string) {
        this.ticker = ticker;
    }

    public async getRates() {
        const res = await axios.get(`${this.BaseUrl}function=TIME_SERIES_DAILY&symbol=${this.ticker}&apikey=${this.API_KEY}`)
        const temp = res.data['Time Series (Daily)'][ res.data['Meta Data']['3. Last Refreshed'] ];

        const daily: Daily = {
            open: temp['1. open'],
            high: temp['2. high'],
            low: temp['3. low'],
            close: temp['4. close'],
            volume: temp['5. volume'],
        }

        const flat_obj: StockApiResponse = {
            symbol: res.data['Meta Data']['2. Symbol'],
            last_refreshed: res.data['Meta Data']['3. Last Refreshed'],
            daily: daily
        }

        flat_obj.daily = daily;
        return flat_obj;
    }

    /**
     * This function will save the values into the database.
     */
    public async storeRates(data: StockApiResponse) {
        const prices = new Prices();
        const store = await prices.store('alphavantage', data.symbol, data.last_refreshed, 0, data.daily.open, data.daily.high, data.daily.low, data.daily.close, data.daily.volume);
    }
}

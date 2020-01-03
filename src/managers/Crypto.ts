import axios from 'axios';
import * as _ from "lodash";
import * as moment from 'moment';
import Prices from "./Prices";
import Config from "../config";
import {AssetModel} from '../models/Asset';

interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

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
    DAILY = '1',
    WEEKLY = '7',
    MONTHLY = '30'
}

const JsonKeys = {
    DAILY: 'Time Series (Daily)',
    WEEKLY: 'Weekly Time Series',
    MONTHLY: 'Monthly Time Series',
}

export default class Crypto {
    /**
     * Docs: https://min-api.cryptocompare.com/documentation?key=Historical&cat=dataPriceHistorical&api_key=e67c901b3344b5df02de297a561c8162b39d9cc38a9f2d61464f7670ec66bdf7
     */
    BaseUrl: string = "https://min-api.cryptocompare.com/data/v2/histoday?";

    public type: string = 'crypto';
    public ticker: string;
    private API_KEY: string;

    constructor(ticker: string) {
        this.ticker = ticker
        this.API_KEY = Config.CRYPTOCOMPARE_APIKEY;
    }

    //public async getRates(timeframe: string = 'DAILY'): Promise<GetRateReturn> {
    public async getRates(timeframe: string = 'DAILY', since: string = '2019-01-01') {

        const dbres = await AssetModel.findOne({ symbol: this.ticker });
        if( dbres ) {
            const now = moment().startOf('day').utcOffset('00:00');
            if( moment( dbres.last_refreshed ).isSameOrAfter( now ) ) {
                return dbres;
            }
        }

        const res = await axios.get(`${this.BaseUrl}fsym=${this.ticker}&tsym=USD&aggregate=${Timeframe[timeframe]}&limit=1000&api_key=${this.API_KEY}`)
        
        const flat_data: HistoricalData[] = _.map(res.data.Data.Data, val => {
            return {
                [moment.unix(val.time).format('YYYY-MM-DD')] : {
                    open: val.open,
                    high: val.high,
                    low: val.low,
                    close: val.close,
                    volume: val.volumeto,
                }
            }
        });
        
        const flat_obj: StockApiResponseMulti = {
            symbol: this.ticker,
            last_refreshed: (res.data.TimeTo ? moment.unix(res.data.TimeTo).format() : moment().startOf('day').utcOffset('00:00').format() ),
            data: flat_data.reverse()
        }

        if( dbres ) {
            await AssetModel.findOneAndUpdate({ symbol: flat_obj.symbol }, flat_obj);
        } else {
            await AssetModel.findOneOrCreate({ symbol: flat_obj.symbol }, flat_obj);
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

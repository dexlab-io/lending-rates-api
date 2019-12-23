import axios from 'axios';
import * as moment from 'moment';
import * as _ from "lodash";
import Stock from './Stock';
import Crypto from './Crypto';

const groupByMonth = (data) => _.groupBy(data, function (o) {
    return moment(o.date).startOf('month').format();
});

const getAvgByMonth = (data) => {
    const months = []
    _.forEach(data, function(value, key) {
        const supplyRates = value.map(obj => obj.rate_per);
        months.push({
            month: moment(key).format('MMMM'),
            rate: _.mean(supplyRates),
            ticker: value[0].ticker
        })
    });
    return months;
}

const groupEtfByMonth = (data) => {
    const months = []
    _.forEach(data, function(value, key) {
        const t = {
            month: moment(key).format('MMM'),
        }

        value.forEach( v => {
            t[v.ticker] = v.price;
        });
        
        if(moment(key).isAfter('2018-12-31') && moment(key).isBefore('2020-01-01')) {
            months.push(t);
        }
    });
    return months;
}

const EtfToChart = (data, ticker) => {
    const flat = [];
    //@ts-ignore
    data.forEach(val => {
        try {
            const complex = Object.entries(val);
            const key = complex[0][0];
            let t = key.split('-')
            if( parseInt(t[0]) <= 2019 && parseInt(t[2]) < 4){
                return;
            }
            const formatted_date = `${t[1]}`;
            const obj = complex[0][1];
            //@ts-ignore
            flat.push( {ticker, date: key, date_full: formatted_date, price: obj.close} )
        } catch (e) {}
    });
    return flat;
}

export default class Charts {
    async getCompoundData() {
        //SAI
        const url = `https://api.compound.finance/api/v2/market_history/graph?asset=0xf5dce57282a584d2746faf1593d3121fcac444dc&min_block_timestamp=1554140144&max_block_timestamp=1576953296&num_buckets=1000`;
        const res = await axios.get(url);

        const compound = res.data.supply_rates.map(o => {
            return {
                rate: o.rate,
                rate_per: o.rate * 100,
                date: moment.unix(o.block_timestamp).format('YYYY-MM-DD'),
                ticker: 'SAI'
            }
        })

        const groups = groupByMonth(compound);
        const months = getAvgByMonth(groups);

        return months;
    }

    async getSingleAsset(ticker: string) {
        const single = new Stock(ticker);
        const res = await single.getRates('MONTHLY');
        return groupEtfByMonth(EtfToChart(res.data, res.symbol));
    }

    async getSingleCryptoAsset(ticker: string) {
        const single = new Crypto(ticker);
        const res = await single.getRates('MONTHLY');
        return res;
    }

    
    async getEtfData() {
        const VTI = new Stock('VTI');
        const TLT = new Stock('TLT');
        const IEI = new Stock('IEI');
        const GLD = new Stock('GLD');
        const GSG = new Stock('GSG');
        
        const values = await Promise.all([
            VTI.getRates('MONTHLY'), 
            TLT.getRates('MONTHLY'), 
            IEI.getRates('MONTHLY'), 
            GLD.getRates('MONTHLY'), 
            GSG.getRates('MONTHLY')]
        );

        return groupEtfByMonth(groupByMonth(_.flattenDeep(values.map( o => EtfToChart(o.data, o.symbol)))));
    }

    async main() {

        return await this.getCompoundData()
    }
}

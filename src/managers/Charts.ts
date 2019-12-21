import axios from 'axios';
import * as moment from 'moment';
import * as _ from "lodash";
import Config from "../config";

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
        

        // const VTI = new Stock('VTI');
        // const TLT = new Stock('TLT');
        // const IEI = new Stock('IEI');
        // const GLD = new Stock('GLD');
        // const GSG = new Stock('GSG');

        // [VTI, TLT, IEI, GLD, GSG].forEach(element => {
            
        // });
    }

    async main() {

        return await this.getCompoundData()
    }
}
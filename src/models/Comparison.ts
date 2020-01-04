import * as mongoose from 'mongoose';

const comparisonSchema = new mongoose.Schema({
    "date": {
      "type": "String"
    },
    "data": {
      "type": [
        "Mixed"
      ]
    },
});

comparisonSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
    const one = await this.findOne(condition);
    return one || this.create(doc);
});

const ComparisonModel = mongoose.model('Comparison', comparisonSchema);

export {
    ComparisonModel
} ;
import * as mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    "symbol": {
      "type": "String"
    },
    "last_refreshed": {
      "type": "Date"
    },
    "data": {
      "type": [
        "Mixed"
      ]
    },
});

assetSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
    const one = await this.findOne(condition);
    return one || this.create(doc);
});

const AssetModel = mongoose.model('Asset', assetSchema);

export {
    AssetModel
} ;
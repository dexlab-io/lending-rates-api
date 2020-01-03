import * as mongoose from 'mongoose';

const connect = async () => {
    try {
        return await mongoose.connect('mongodb://staging:stagingdb123@ds259528.mlab.com:59528/pie-backend', { useNewUrlParser: true });
    } catch (error) {
        console.log('error', error);
        return Promise.reject(error);
    }
}

export default connect;
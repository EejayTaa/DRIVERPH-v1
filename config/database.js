const mongoose = require('mongoose');

require("dotenv").config();
const database = process.env.MONGO_URI;

const connectDatabase = async () => {
    try{
        await mongoose.connect(database, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,

        })
        console.log('MongoDB is connected.');

    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;
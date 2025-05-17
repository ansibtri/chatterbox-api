const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {logger} = require('../utility/Logger.utility')
dotenv.config();
async function connectDB(){
    const connectionURI = process.env.MONDODB_URI || process.env.MONGODB_LOCAL_URI;
    try{
        const conn = await mongoose.connect(connectionURI);
        console.log('Database connected')
        console.log(`Connection Host: ${conn.connection.host}`);
        console.log("Connection Name: "+ conn.connection.name);
        console.log(`Connection Port: ${conn.connection.port}`);
    }catch(err){
        console.log(err);
        logger('severe', err.message, 'database')
        process.exit(1);
    }
}
connectDB()
module.exports = connectDB;
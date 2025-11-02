import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/authSystem';

function connectDb() {
    const dbUrl = DATABASE_URL
    mongoose.connect(dbUrl)
        .then(() => {
            console.log('connected to db');
        })
        .catch((error) => {
            console.log(error);
            console.log("Db error");
        })
}

export default connectDb
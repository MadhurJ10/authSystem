import mongoose from "mongoose";

function connectDb() {
    const dbUrl = 'mongodb://127.0.0.1:27017/authSystem'
    mongoose.connect(dbUrl)
        .then(() => {
            console.log('connected to db');
        })
        .catch(() => {
            console.log("eroroorro")
        })
}

export default connectDb
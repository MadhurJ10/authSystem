import 'dotenv/config';
import app from './src/app.js'
import connectDb from './src/config/db.js'


const PORT = process.env.PORT;
console.log(PORT)


connectDb();
app.listen(PORT, () => {
    console.log("server started")
})
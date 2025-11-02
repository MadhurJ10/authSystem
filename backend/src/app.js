import 'dotenv/config';
import express from 'express'
import authRoute from '../src/routes/auth.route.js'

const app = express();
app.use(express.json())

app.use('/', authRoute)

export default app
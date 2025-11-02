import express from 'express'
import authRoute from '../src/routes/auth.route.js'
import { authMiddleware } from './middlewares/auth.middleware.js';



const app = express();
app.use(express.json())

app.get('/' , (req ,res) => {
    res.send("helllllll");
})
app.use('/' ,authRoute)

export default app
import express from 'express'

const router = express.Router();

import { register ,login, changePassword ,forgotPassword ,  resetPassword , getData , logout} from '../controllers/auth.controller.js';
import { authMiddleware ,adminOnly } from '../middlewares/auth.middleware.js';


router.post('/register' , register)
router.post('/login' , login)
router.post('/change-password' ,authMiddleware , changePassword)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get('/getData' , authMiddleware , adminOnly , getData)
router.post('/logout' , authMiddleware , logout)

export default router;

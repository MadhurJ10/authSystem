import express from 'express'
const router = express.Router();
import { register ,login, changePassword ,forgotPassword ,  resetPassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';


router.post('/register' , register)
router.post('/login' , login)
router.post('/change-password' ,authMiddleware , changePassword)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);



export default router;

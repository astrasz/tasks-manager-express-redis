import express from 'express';
import * as authController from '../controllers/auth.js'

const router = express.Router();

router.get('/signup', authController.showSignupForm)
router.get('/signin', authController.showSigninForm)
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);


export default router;
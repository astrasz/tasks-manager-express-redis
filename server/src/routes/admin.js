import express from 'express';
import authRole from '../middlewares/authRole.js'
import { ROLE } from '../models/user.js';
import * as adminController from '../controllers/admin.js';


const router = express.Router();

router.get('/admin', authRole(ROLE.ADMIN), adminController.showAdminBoard);



export default router;
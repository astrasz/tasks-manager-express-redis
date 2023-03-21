import express from 'express';
import authRole from '../middlewares/authRole.js'
import { ROLE } from '../models/user.js';
import * as adminController from '../controllers/admin.js';
import { isAuthenticated } from '../middlewares/passport.js';
import { cacheData } from '../middlewares/cache.js';


const router = express.Router();

router.get('/admin', isAuthenticated, authRole(ROLE.ADMIN), cacheData, adminController.showAdminBoard);
router.put('/admin/users/:userId', isAuthenticated, authRole(ROLE.ADMIN), adminController.changeUserState);
router.put('/admin/users/:userId/role', isAuthenticated, authRole(ROLE.ADMIN), adminController.changeUserRole);



export default router;
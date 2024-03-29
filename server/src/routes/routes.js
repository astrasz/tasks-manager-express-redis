import express from 'express';
import authRoutes from './auth.js'
import tasksRoutes from './tasks.js';
import adminRoutes from './admin.js';

const router = express.Router();

router.use(authRoutes);
router.use(adminRoutes);
router.use(tasksRoutes);

export default router
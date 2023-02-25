import express from 'express';
import authRoutes from './auth.js'
import tasksRoutes from './tasks.js';

const router = express.Router();

router.use(authRoutes);
router.use(tasksRoutes);

export default router
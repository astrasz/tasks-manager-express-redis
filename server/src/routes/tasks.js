import express from 'express';
import * as tasksController from '../controllers/tasks.js'
import { isAuthenticated } from '../middlewares/passport.js';

const router = express.Router();

router.get('/', isAuthenticated, tasksController.getTasks);

export default router;
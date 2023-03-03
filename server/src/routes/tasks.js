import express from 'express';
import * as tasksController from '../controllers/tasks.js'
import { cacheData, cachTaskById } from '../middlewares/cache.js';
import { isAuthenticated } from '../middlewares/passport.js';

const router = express.Router();

router.get('/', isAuthenticated, cacheData, tasksController.listTasks);
router.post('/new', isAuthenticated, tasksController.addNewTask)
router.get('/:taskId', isAuthenticated, cachTaskById, tasksController.getTaskById);
router.put('/:taskId', isAuthenticated, tasksController.updateTask);
router.delete('/:taskId', isAuthenticated, tasksController.deleteTask);


export default router;
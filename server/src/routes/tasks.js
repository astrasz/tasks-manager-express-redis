import express from 'express';
import * as tasksController from '../controllers/tasks.js'
import { cacheData, cachTaskById } from '../middlewares/cache.js';
import { isAuthenticated } from '../middlewares/passport.js';

const router = express.Router();

router.get('/', isAuthenticated, cacheData, tasksController.listTasks);
router.get('/error', isAuthenticated, tasksController.displayInvalidForm)
router.post('/new', isAuthenticated, tasksController.addNewTask)
router.put('/:taskId', isAuthenticated, tasksController.updateTask);
router.delete('/:taskId', isAuthenticated, tasksController.deleteTask);
router.get('/:taskId', isAuthenticated, cachTaskById, tasksController.getTaskById);



export default router;
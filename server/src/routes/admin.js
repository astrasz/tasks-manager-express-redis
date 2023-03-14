import express from 'express';
import authRole from '../middlewares/authRole.js'
import { ROLE } from '../models/user.js';


const router = express.Router();

router.get('/admin', authRole(ROLE.ADMIN), (req, res, next) => {
    res.send("I'm admin!");
})



export default router;
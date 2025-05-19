import express from 'express';
import { register, login, verifyAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-admin', verifyAdmin);

export default router;
import express from 'express';
import { register, login, verifyAdmin, updateProfile, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-admin', verifyAdmin);
router.get('/profile/:userId', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
import express from 'express';
import MythController from '../controllers/mythController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', MythController.getAll);
router.get('/:id', MythController.getById);

// Rutas protegidas
router.post('/', authenticate, MythController.create);
router.put('/:id', authenticate, MythController.update);
router.delete('/:id', authenticate, MythController.delete);
router.post('/upload-image', authenticate, MythController.uploadImage);
router.patch('/:id/verify', authenticate, MythController.verifyMyth);

export default router;
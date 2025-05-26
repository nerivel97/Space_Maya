import express from 'express';
import VocabularioController from '../controllers/vocabularioController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', VocabularioController.getAll);
router.get('/categoria/:categoria', VocabularioController.getByCategory);
router.get('/:id', VocabularioController.getById);

// Rutas protegidas
router.post('/', authenticate, VocabularioController.create);
router.put('/:id', authenticate, VocabularioController.update);
router.delete('/:id', authenticate, VocabularioController.delete);
router.post('/upload-image', authenticate, VocabularioController.uploadImage);

export default router;
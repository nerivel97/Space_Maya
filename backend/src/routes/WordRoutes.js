import express from 'express';
import WordController from '../controllers/WordController.js';

const router = express.Router();

router.get('/', WordController.getAll);         // Obtener todas las palabras con filtros
router.get('/:id', WordController.getById);     // Obtener una palabra por ID
router.post('/', WordController.create);        // Crear una nueva palabra
router.put('/:id', WordController.update);      // Actualizar palabra por ID
router.delete('/:id', WordController.delete);   // Eliminar palabra por ID

export default router;

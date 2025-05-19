import express from 'express';
import { getMarkers, createMarker, updateMarker, deleteMarker } from '../controllers/markerController.js';
import { authenticate } from '../middlewares/auth.js';


const router = express.Router();

router.get('/', authenticate, getMarkers);
router.post('/', authenticate, createMarker);
router.put('/:id', authenticate, updateMarker);
router.delete('/:id', authenticate, deleteMarker);

export default router;
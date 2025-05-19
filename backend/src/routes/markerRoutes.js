import express from 'express';
import { getMarkers, createMarker } from '../controllers/markerController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getMarkers);
router.post('/', authenticate, createMarker);

export default router;
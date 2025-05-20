import express from 'express';
import multer from 'multer';
import { getMarkers, createMarker, updateMarker, deleteMarker, uploadImage } from '../controllers/markerController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

router.get('/', authenticate, getMarkers);
router.post('/', authenticate, createMarker);
router.post('/upload-image', authenticate, upload.single('image'), uploadImage); // Nueva ruta para subir imágenes
router.put('/:id', authenticate, updateMarker);
router.delete('/:id', authenticate, deleteMarker);

export default router;
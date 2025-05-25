import express from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllMyths,
  getMythById,
  createMyth,
  updateMyth,
  deleteMyth,
  getMetadata,
  uploadMythImage
} from '../controllers/mythController.js';

const router = express.Router();

// Configuración de Multer específica para Mitos
const mythStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/myths/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `myth-${uniqueSuffix}.${ext}`);
  }
});

const uploadMythFiles = multer({ 
  storage: mythStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF)'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Ruta para subida individual de imágenes
router.post('/upload-image', authenticate, uploadMythFiles.single('image'), uploadMythImage);

// Rutas públicas
router.get('/', getAllMyths);
router.get('/:id', getMythById);
router.get('/metadata/categories', getMetadata);

// Rutas protegidas
router.post(
  '/',
  authenticate,
  uploadMythFiles.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 10 }
  ]),
  createMyth
);

router.put(
  '/:id',
  authenticate,
  uploadMythFiles.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 10 }
  ]),
  updateMyth
);

router.delete('/:id', authenticate, deleteMyth);

export default router;
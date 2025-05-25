import MythModel from '../models/Myths.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/myths');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'myth-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten JPEG, PNG y GIF.'), false);
    }
  }
}).single('image');

const MythController = {
  async getAll(req, res) {
    try {
      const myths = await MythModel.getAll();
      res.json({ success: true, data: myths });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener mitos y leyendas' });
    }
  },

  async getById(req, res) {
    try {
      const myth = await MythModel.getById(req.params.id);
      if (!myth) {
        return res.status(404).json({ success: false, message: 'Mito/Leyenda no encontrado' });
      }
      res.json({ success: true, data: myth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener el mito/leyenda' });
    }
  },

  async create(req, res) {
    try {
      const { user } = req;
      const mythData = {
        ...req.body,
        created_by: user.id
      };
      
      const newMyth = await MythModel.create(mythData);
      res.status(201).json({ success: true, data: newMyth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al crear mito/leyenda' });
    }
  },

  async update(req, res) {
    try {
      const updatedMyth = await MythModel.update(req.params.id, req.body);
      res.json({ success: true, data: updatedMyth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar mito/leyenda' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await MythModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Mito/Leyenda no encontrado' });
      }
      res.json({ success: true, message: 'Mito/Leyenda eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar mito/leyenda' });
    }
  },

  async uploadImage(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error al subir la imagen' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No se proporcionó ninguna imagen' 
        });
      }

      try {
        const imagePath = `/uploads/myths/${req.file.filename}`;
        res.json({ 
          success: true, 
          data: { 
            imageUrl: imagePath,
            filename: req.file.filename
          } 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ 
          success: false, 
          message: 'Error al procesar la imagen' 
        });
      }
    });
  },

  async verifyMyth(req, res) {
    try {
      const { is_verified } = req.body;
      const verifiedMyth = await MythModel.verifyMyth(req.params.id, is_verified);
      res.json({ success: true, data: verifiedMyth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al verificar mito/leyenda' });
    }
  }
};

export default MythController;
import Myths from '../models/Myths.js';
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
      const myths = await Myths.getAll();
      res.json({ success: true, data: myths });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener mitos y leyendas' });
    }
  },

  async getById(req, res) {
    try {
      const myth = await Myths.getById(req.params.id);
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
    const { 
      title, 
      content, 
      origin_region, 
      origin_culture, 
      category, 
      estimated_origin_year, 
      featured_image 
    } = req.body;

    // Validación exhaustiva
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ success: false, message: 'Título inválido o faltante' });
    }
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Contenido inválido o faltante' });
    }
    if (!origin_region || typeof origin_region !== 'string') {
      return res.status(400).json({ success: false, message: 'Región de origen inválida o faltante' });
    }
    if (!origin_culture || typeof origin_culture !== 'string') {
      return res.status(400).json({ success: false, message: 'Cultura de origen inválida o faltante' });
    }
    if (!category || !['Mito', 'Leyenda', 'Fábula', 'Tradición'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Categoría inválida o faltante' });
    }

    const mythData = {
      title: title.trim(),
      content: content.trim(),
      origin_region: origin_region.trim(),
      origin_culture: origin_culture.trim(),
      category,
      estimated_origin_year: estimated_origin_year ? estimated_origin_year.trim() : null,
      featured_image: featured_image || null
    };

    console.log('Datos del mito a crear:', mythData);

    const newMyth = await Myths.create(mythData);
    res.status(201).json({ success: true, data: newMyth });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear mito/leyenda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  async update(req, res) {
    try {
      const updatedMyth = await Myths.update(req.params.id, req.body);
      res.json({ success: true, data: updatedMyth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar mito/leyenda' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Myths.delete(req.params.id);
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
      const verifiedMyth = await Myths.verifyMyth(req.params.id, is_verified);
      res.json({ success: true, data: verifiedMyth });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al verificar mito/leyenda' });
    }
  }
};

export default MythController;
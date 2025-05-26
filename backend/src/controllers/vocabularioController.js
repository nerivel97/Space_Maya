import Vocabulario from '../models/Vocabulario.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/vocabulario');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'voc-' + uniqueSuffix + ext);
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

const VocabularioController = {
  async getAll(req, res) {
    try {
      const vocabulario = await Vocabulario.getAll();
      res.json({ success: true, data: vocabulario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener vocabulario' });
    }
  },

  async getById(req, res) {
    try {
      const voc = await Vocabulario.getById(req.params.id);
      if (!voc) {
        return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
      }
      res.json({ success: true, data: voc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener la palabra' });
    }
  },

  async create(req, res) {
    try {
      const { 
        palabra_espanol, 
        palabra_maya, 
        pronunciacion, 
        categoria, 
        significado, 
        ejemplo_uso_espanol, 
        ejemplo_uso_maya 
      } = req.body;

      // Validación
      if (!palabra_espanol || typeof palabra_espanol !== 'string') {
        return res.status(400).json({ success: false, message: 'Palabra en español inválida o faltante' });
      }
      if (!palabra_maya || typeof palabra_maya !== 'string') {
        return res.status(400).json({ success: false, message: 'Palabra en maya inválida o faltante' });
      }
      if (!categoria || !['Sustantivo', 'Verbo', 'Adjetivo', 'Frase', 'Otro'].includes(categoria)) {
        return res.status(400).json({ success: false, message: 'Categoría inválida o faltante' });
      }

      const vocData = {
        palabra_espanol: palabra_espanol.trim(),
        palabra_maya: palabra_maya.trim(),
        pronunciacion: pronunciacion ? pronunciacion.trim() : null,
        categoria,
        significado: significado ? significado.trim() : null,
        ejemplo_uso_espanol: ejemplo_uso_espanol ? ejemplo_uso_espanol.trim() : null,
        ejemplo_uso_maya: ejemplo_uso_maya ? ejemplo_uso_maya.trim() : null,
        imagen_url: req.body.imagen_url || null
      };

      const newVoc = await Vocabulario.create(vocData);
      res.status(201).json({ success: true, data: newVoc });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear palabra',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async update(req, res) {
    try {
      const updatedVoc = await Vocabulario.update(req.params.id, req.body);
      res.json({ success: true, data: updatedVoc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar palabra' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Vocabulario.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
      }
      res.json({ success: true, message: 'Palabra eliminada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar palabra' });
    }
  },

  async getByCategory(req, res) {
    try {
      const vocabulario = await Vocabulario.getByCategory(req.params.categoria);
      res.json({ success: true, data: vocabulario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener vocabulario por categoría' });
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
        const imagePath = `/uploads/vocabulario/${req.file.filename}`;
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
  }
};

export default VocabularioController;
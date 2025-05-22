import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middlewares/auth.js';
import markerRoutes from './routes/markerRoutes.js';
import forumRoutes from './routes/forumRoutes.js';

dotenv.config();

const app = express();

// Crear directorio uploads si no existe
const uploadsDir = path.join(path.resolve(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración mejorada de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware para archivos estáticos con headers personalizados
app.use('/uploads', (req, res, next) => {
  // Deshabilitar caché en desarrollo
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  next();
}, express.static(path.join(path.resolve(), 'public', 'uploads'), {
  // Opciones adicionales para express.static
  dotfiles: 'ignore',
  etag: false,
  extensions: ['jpg', 'jpeg', 'png', 'gif'],
  index: false,
  maxAge: '1d',
  redirect: false
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/profile', authRoutes);
app.use('/api/forum', forumRoutes);

// Ruta protegida
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida', user: req.user });
});

// Manejador de errores mejorado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Serving static files from: ${uploadsDir}`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http'; // Importa createServer de http
import { Server } from 'socket.io'; // Importa Server de socket.io
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middlewares/auth.js';
import markerRoutes from './routes/markerRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import { saveMessageToDatabase } from './controllers/forumController.js'; // Asegúrate de tener esta función

dotenv.config();

const app = express();
const httpServer = createServer(app); // Crea el servidor HTTP

// Configuración de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io' // Ruta base para Socket.io
});

// Middleware para autenticar conexiones Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('No se proporcionó token'));
  }
  // Aquí deberías verificar el token JWT como lo haces en tus rutas HTTP
  next();
});

// Manejo de conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Unirse a una sala de grupo
  socket.on('joinGroup', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`Usuario ${socket.id} unido al grupo ${groupId}`);
  });

  // Manejar nuevos mensajes
  socket.on('newMessage', async (messageData) => {
    try {
      // 1. Guardar el mensaje en la base de datos
      const savedMessage = await saveMessageToDatabase(messageData);
      
      // 2. Emitir el mensaje a todos en el grupo
      io.to(`group_${messageData.groupId}`).emit('messageReceived', savedMessage);
      
      console.log('Mensaje enviado a grupo:', messageData.groupId);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      socket.emit('messageError', { error: 'Error al enviar mensaje' });
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Configuración mejorada de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware para archivos estáticos (igual que antes)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  next();
}, express.static(path.join(path.resolve(), 'public', 'uploads'), {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['jpg', 'jpeg', 'png', 'gif'],
  index: false,
  maxAge: '1d',
  redirect: false
}));

// Rutas (igual que antes)
app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/profile', authRoutes);
app.use('/api/forum', forumRoutes);

// Ruta protegida
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida', user: req.user });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(path.resolve(), 'public', 'uploads');

httpServer.listen(PORT, () => {
  console.log(`Servidor HTTP y WebSocket corriendo en puerto ${PORT}`);
  console.log(`Serving static files from: ${uploadsDir}`);
});
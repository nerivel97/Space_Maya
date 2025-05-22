import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import markerRoutes from './routes/markerRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import { authenticate } from './middlewares/auth.js';
import { saveMessageToDatabase } from './controllers/forumController.js';
import jwt from 'jsonwebtoken';
import pool from '../src/config/db.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuración de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io'
});

// Middleware de autenticación para Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('No se proporcionó token'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    return next(new Error('Token inválido'));
  }
});

// Manejo de conexiones Socket.io
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.userId}`);

  // Manejar reconexión
  socket.on('reconnect', () => {
    console.log(`Usuario reconectado: ${socket.userId}`);
  });

  socket.on('joinGroup', async (groupId) => {
    try {
      socket.join(`group_${groupId}`);
      console.log(`Usuario ${socket.userId} unido al grupo ${groupId}`);
      
      // Actualizar last_read_at
      await pool.execute(
        'UPDATE group_members SET last_read_at = NOW() WHERE group_id = ? AND user_id = ?',
        [groupId, socket.userId]
      );
    } catch (error) {
      console.error('Error joining group:', error);
    }
  });

  socket.on('newMessage', async (messageData) => {
    try {
      const savedMessage = await saveMessageToDatabase({
        ...messageData,
        userId: socket.userId
      });
      
      io.to(`group_${messageData.groupId}`).emit('messageReceived', savedMessage);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      socket.emit('messageError', { 
        error: 'Error al enviar mensaje',
        tempId: messageData.tempId 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.userId}`);
  });
});

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware para archivos estáticos
app.use('/uploads', express.static(path.join(path.resolve(), 'public', 'uploads'), {
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
app.use('/api/forum', forumRoutes);

// Ruta protegida de ejemplo
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida', user: req.user });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Servidor HTTP y WebSocket corriendo en puerto ${PORT}`);
  console.log(`URL del frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
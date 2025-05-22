import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getGroups,
  getUserGroups,
  createGroup,
  joinGroup,
  getGroupMessages,
  sendGroupMessage,
  markMessagesAsRead,
  getNotifications,
  markNotificationAsRead
} from '../controllers/forumController.js';

const router = express.Router();

// Rutas de grupos
router.get('/groups', getGroups);
router.get('/user/groups', authenticate, getUserGroups);
router.post('/groups', authenticate, createGroup);
router.post('/groups/:groupId/join', authenticate, joinGroup);

// Rutas de mensajes
router.get('/groups/:groupId/messages', authenticate, getGroupMessages);
router.post('/groups/:groupId/messages', authenticate, sendGroupMessage);
router.put('/groups/:groupId/mark-read', authenticate, markMessagesAsRead);

// Rutas de notificaciones
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:notificationId/read', authenticate, markNotificationAsRead);

export default router;
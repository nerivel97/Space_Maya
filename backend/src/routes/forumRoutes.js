import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getGroups, createGroup, joinGroup, markNotificationAsRead, getNotifications, getGroupMessages, sendGroupMessage } from '../controllers/forumController.js';

const router = express.Router();

router.get('/groups', getGroups);
router.post('/groups', authenticate, createGroup);
router.post('/groups/:groupId/join', authenticate, joinGroup);

router.get('/groups/:groupId/messages', authenticate, getGroupMessages);
router.post('/groups/:groupId/messages', authenticate, sendGroupMessage);

router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:notificationId/read', authenticate, markNotificationAsRead);

export default router;
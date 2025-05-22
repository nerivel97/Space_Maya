import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getGroups, createGroup, joinGroup, getDiscussionMessages,getGroupDiscussions, createDiscussion, markNotificationAsRead, getNotifications, postMessage } from '../controllers/forumController.js';

const router = express.Router();

router.get('/groups', getGroups);
router.post('/groups', authenticate, createGroup);
router.post('/groups/:groupId/join', authenticate, joinGroup);
router.get('/groups/:groupId/discussions', authenticate, getGroupDiscussions);
router.post('/groups/:groupId/discussions', authenticate, createDiscussion);
router.get('/discussions/:discussionId/messages', authenticate, getDiscussionMessages);
router.post('/discussions/:discussionId/messages', authenticate, postMessage);

router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:notificationId/read', authenticate, markNotificationAsRead);

export default router;
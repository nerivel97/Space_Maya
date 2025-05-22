import Group from '../models/Group.js';
import Discussion from '../models/Discussion.js';
import Message from '../models/Message.js'
import Notification from '../models/Notification.js';

export const getGroups = async (req, res) => {
  try {
    const { search, university, tab } = req.query;
    
    let featured = false;
    if (tab === 'populares') {
      featured = true;
    }

    const groups = await Group.findAll({ search, university, featured });
    
    // Agregar información de miembros y discusiones
    const enhancedGroups = await Promise.all(groups.map(async group => {
      const membersCount = await Group.getMembersCount(group.id);
      const discussionsCount = await Group.getDiscussionsCount(group.id);
      
      return {
        ...group,
        members: membersCount,
        discussions: discussionsCount,
        lastActivity: 'Reciente' // Esto se puede mejorar con la última actividad real
      };
    }));

    res.json(enhancedGroups);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos' });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, description, university, isPublic } = req.body;
    const createdBy = req.user.userId;

    if (!name || !description || !university) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const groupId = await Group.create({
      name,
      description,
      university,
      isPublic,
      createdBy
    });

    // Hacer al creador miembro y admin del grupo
    await Group.addMember(groupId, createdBy, true);

    res.status(201).json({ id: groupId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear grupo' });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // Verificar si el grupo existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    // Verificar si el usuario ya es miembro
    const isMember = await Group.isMember(groupId, userId);
    if (isMember) {
      return res.status(400).json({ message: 'Ya eres miembro de este grupo' });
    }

    // Verificar si el grupo es público
    if (!group.is_public) {
      return res.status(403).json({ message: 'Este grupo es privado' });
    }

    await Group.addMember(groupId, userId);
    res.json({ message: 'Te has unido al grupo exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al unirse al grupo' });
  }
};

export const getGroupDiscussions = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verificar si el usuario es miembro del grupo
    const isMember = await Group.isMember(groupId, req.user.userId);
    const group = await Group.findById(groupId);
    
    if (!group.is_public && !isMember) {
      return res.status(403).json({ message: 'No tienes acceso a este grupo' });
    }

    const discussions = await Discussion.findByGroupId(groupId);
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener discusiones' });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    // Verificar permisos del usuario
    const [permission] = await pool.execute(
      'SELECT can_create_discussions FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (!permission.length || !permission[0].can_create_discussions) {
      return res.status(403).json({ message: 'No tienes permiso para crear discusiones' });
    }

    const discussionId = await Discussion.create({
      groupId,
      title,
      content,
      createdBy: userId
    });

    // Notificar a los miembros del grupo
    const group = await Group.findById(groupId);
    const [members] = await pool.execute(
      'SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?',
      [groupId, userId]
    );

    await Promise.all(members.map(async member => {
      await Notification.create({
        userId: member.user_id,
        type: 'new_discussion',
        content: `Nueva discusión en ${group.name}: ${title}`,
        relatedId: discussionId,
        relatedType: 'discussion'
      });
    }));

    res.status(201).json({ id: discussionId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear discusión' });
  }
};

export const getDiscussionMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    // Verificar acceso a la discusión
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discusión no encontrada' });
    }

    const isMember = await Group.isMember(discussion.group_id, req.user.userId);
    const group = await Group.findById(discussion.group_id);
    
    if (!group.is_public && !isMember) {
      return res.status(403).json({ message: 'No tienes acceso a esta discusión' });
    }

    const messages = await Message.findByDiscussionId(discussionId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Verificar acceso a la discusión
    const discussion = await Discussion.findById(discussionId);
    const isMember = await Group.isMember(discussion.group_id, userId);
    const group = await Group.findById(discussion.group_id);
    
    if (!group.is_public && !isMember) {
      return res.status(403).json({ message: 'No tienes acceso a esta discusión' });
    }

    const messageId = await Message.create({
      discussionId,
      content,
      userId
    });

    // Notificar al creador de la discusión si es diferente al remitente
    if (discussion.created_by !== userId) {
      await Notification.create({
        userId: discussion.created_by,
        type: 'new_message',
        content: `Nuevo mensaje en tu discusión: ${discussion.title}`,
        relatedId: discussionId,
        relatedType: 'discussion'
      });
    }

    res.status(201).json({ id: messageId });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findByUser(req.user.userId, {
      unreadOnly: req.query.unread === 'true'
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsRead(notificationId);
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar notificación' });
  }
};
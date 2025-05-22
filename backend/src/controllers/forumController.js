// controllers/forumController.js
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';
import GroupMessage from '../models/GroupMessage.js';
import pool from '../config/db.js';

export const getGroups = async (req, res) => {
  try {
    const { search, university, tab } = req.query;

    const featured = tab === 'populares';

    const groups = await Group.findAll({ search, university, featured });

    const enhancedGroups = await Promise.all(groups.map(async group => {
      const membersCount = await Group.getMembersCount(group.id);
      const messagesCount = await Group.getMessagesCount(group.id);
      return {
        ...group,
        members: membersCount,
        messages: messagesCount,
        lastActivity: 'Reciente'
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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });

    const isMember = await Group.isMember(groupId, userId);
    if (isMember) return res.status(400).json({ message: 'Ya eres miembro de este grupo' });

    if (!group.is_public) return res.status(403).json({ message: 'Este grupo es privado' });

    await Group.addMember(groupId, userId);
    res.json({ message: 'Te has unido al grupo exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al unirse al grupo' });
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

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupMessage.findByGroupId(groupId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes del grupo' });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'El contenido no puede estar vacío' });
    }

    await GroupMessage.create({ groupId, userId, content });
    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

// Añade esta función para guardar mensajes
// En tu servidor (backend), modifica el controlador de mensajes:
export const saveMessageToDatabase = async (messageData) => {
  const { groupId, content, userId } = messageData;
  
  // 1. Verificar si el mensaje ya existe
  const [existing] = await pool.execute(
    `SELECT id FROM group_messages 
     WHERE content = ? AND user_id = ? AND group_id = ? 
     AND created_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)`,
    [content, userId, groupId]
  );

  if (existing.length > 0) {
    throw new Error('Mensaje duplicado');
  }

  // 2. Guardar el mensaje en la base de datos
  const [result] = await pool.execute(
    'INSERT INTO group_messages (group_id, user_id, content) VALUES (?, ?, ?)',
    [groupId, userId, content]
  );

  // 3. Obtener el mensaje completo con información del autor
  const [messages] = await pool.execute(
    `SELECT gm.*, u.name as author_name 
     FROM group_messages gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.id = ?`,
    [result.insertId]
  );

  if (messages.length === 0) {
    throw new Error('No se pudo recuperar el mensaje recién creado');
  }

  return messages[0];
};
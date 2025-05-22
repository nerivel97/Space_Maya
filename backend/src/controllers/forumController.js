import Group from '../models/Group.js';
import Notification from '../models/Notification.js';

export const getGroups = async (req, res) => {
  try {
    const { search, university, tab } = req.query;
    
    let featured = false;
    if (tab === 'populares') {
      featured = true;
    }

    const groups = await Group.findAll({ search, university, featured });
    
    // Agregar información de miembros
    const enhancedGroups = await Promise.all(groups.map(async group => {
      const membersCount = await Group.getMembersCount(group.id);
      
      return {
        ...group,
        members: membersCount,
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
import { useState, useEffect, useCallback } from 'react';
import {
  FaUniversity, FaUsers, FaSearch, FaPlus, FaBook, FaComments,
  FaStar, FaUser, FaPaperPlane,
  FaTrash, FaEdit, FaBell, FaBellSlash, FaTimes, FaCheck, FaArrowLeft
} from 'react-icons/fa';
import { MdGroups, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import api from '../api/api';
import styles from '../styles/Foro.module.css';

const Foro = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('grupos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para formularios
  const [newGroup, setNewGroup] = useState({
    name: '',
    university: '',
    description: '',
    isPublic: true
  });
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: ''
  });
  const [newMessage, setNewMessage] = useState('');

  // Estados para navegación
  const [view, setView] = useState('groups'); // 'groups', 'discussions', 'messages', 'notifications'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  // Estados para datos
  const [discussions, setDiscussions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);

  const universities = [
    'UNAM', 'UADY', 'Universidad Autónoma de Campeche',
    'Universidad de Quintana Roo', 'Universidad Autónoma de Chiapas'
  ];

  // Funciones de fetch con useCallback
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: searchQuery };
      if (activeTab === 'populares') params.featured = true;

      // Cambia esta parte:
      const response = await api.get('/forum/groups', { params });

      // Si la respuesta es directamente el array:
      if (Array.isArray(response)) {
        setGroups(response);
      }
      // Si la respuesta es { data: [...] } (como axios normalmente devuelve)
      else if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      }
      // Si no es ninguno de los formatos esperados
      else {
        console.error("Formato de respuesta inesperado:", response);
        setGroups([]);
      }

    } catch (err) {
      setError('Error al cargar los grupos');
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  const fetchDiscussions = useCallback(async (groupId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/forum/groups/${groupId}/discussions`);
      setDiscussions(data);
    } catch (err) {
      setError('Error al cargar las discusiones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (discussionId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/forum/discussions/${discussionId}/messages`);
      setMessages(data);
    } catch (err) {
      setError('Error al cargar los mensajes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = showUnreadOnly ? { unread: 'true' } : {};
      const { data } = await api.get('/forum/notifications', { params });
      setNotifications(data);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showUnreadOnly]);

  // Efectos
  useEffect(() => {
    if (view === 'groups') fetchGroups();
    if (view === 'notifications') fetchNotifications();
  }, [view, fetchGroups, fetchNotifications]);

  // Handlers
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/groups', newGroup);
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        university: '',
        description: '',
        isPublic: true
      });
      fetchGroups();
    } catch (err) {
      setError(err.message || 'Error al crear el grupo');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/forum/groups/${groupId}/join`);
      setGroups(groups.map(group =>
        group.id === groupId ? { ...group, members: group.members + 1 } : group
      ));
    } catch (err) {
      setError(err.message || 'Error al unirse al grupo');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forum/groups/${selectedGroup.id}/discussions`, newDiscussion);
      setNewDiscussion({ title: '', content: '' });
      fetchDiscussions(selectedGroup.id);
    } catch (err) {
      setError(err.message || 'Error al crear discusión');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forum/discussions/${selectedDiscussion.id}/messages`, {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedDiscussion.id);
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje');
    }
  };

  const handleUpdateMessage = async () => {
    try {
      await api.put(`/forum/messages/${editingMessage.id}`, {
        content: editingMessage.content
      });
      setEditingMessage(null);
      fetchMessages(selectedDiscussion.id);
    } catch (err) {
      setError(err.message || 'Error al actualizar mensaje');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('¿Estás seguro de eliminar este mensaje?')) {
      try {
        await api.delete(`/forum/messages/${messageId}`);
        fetchMessages(selectedDiscussion.id);
      } catch (err) {
        setError(err.message || 'Error al eliminar mensaje');
      }
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/forum/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      setError('Error al marcar notificación');
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.is_read)
          .map(n => api.put(`/forum/notifications/${n.id}/read`))
      );
      fetchNotifications();
    } catch (err) {
      setError('Error al marcar notificaciones');
    }
  };

  // Vistas
  const renderGroupsView = () => (
    <div className={styles.groupsContainer}>
      <h2 className={styles.sectionTitle}>
        {activeTab === 'grupos' && 'Todos los grupos'}
        {activeTab === 'nuevos' && 'Grupos recientes'}
        {activeTab === 'populares' && 'Grupos populares'}
      </h2>

      {loading ? (
        <div className={styles.loading}>Cargando grupos...</div>
      ) : groups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No se encontraron grupos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map(group => (
            <div
              key={group.id}
              className={`${styles.groupCard} ${group.is_featured ? styles.featured : ''}`}
              onClick={() => {
                setSelectedGroup(group);
                fetchDiscussions(group.id);
                setView('discussions');
              }}
            >
              {group.is_featured && (
                <div className={styles.featuredBadge}>
                  <FaStar /> Destacado
                </div>
              )}
              <div className={styles.groupHeader}>
                <h3 className={styles.groupName}>{group.name}</h3>
              </div>
              <div className={styles.groupUniversity}>
                <FaUniversity /> {group.university}
              </div>
              <p className={styles.groupDescription}>{group.description}</p>
              <div className={styles.groupStats}>
                <div className={styles.statItem}>
                  <FaUsers /> {group.members} miembros
                </div>
                <div className={styles.statItem}>
                  <FaComments /> {group.discussions} discusiones
                </div>
              </div>
              <div className={styles.groupFooter}>
                <button
                  className={styles.joinButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(group.id);
                  }}
                >
                  Unirse al grupo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDiscussionsView = () => (
    <div className={styles.discussionContainer}>
      <button
        className={styles.backButton}
        onClick={() => setView('groups')}
      >
        <FaArrowLeft /> Volver a grupos
      </button>

      <div className={styles.discussionHeader}>
        <h2>Discusiones en {selectedGroup?.name}</h2>
        <button
          className={styles.createButton}
          onClick={() => setNewDiscussion({ title: '', content: '' })}
        >
          <FaPlus /> Nueva Discusión
        </button>
      </div>

      {showDiscussionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setShowDiscussionModal(false)}
            >
              &times;
            </button>
            <h2>Crear nueva discusión</h2>
            <form onSubmit={(e) => {
              handleCreateDiscussion(e);
              setShowDiscussionModal(false);
            }}>
              <div className={styles.formGroup}>
                <label>Título</label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contenido</label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  required
                  rows="5"
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowDiscussionModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Cargando discusiones...</div>
      ) : discussions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay discusiones en este grupo aún.</p>
        </div>
      ) : (
        <div className={styles.discussionList}>
          {discussions.map(discussion => (
            <div
              key={discussion.id}
              className={styles.discussionItem}
              onClick={() => {
                setSelectedDiscussion(discussion);
                fetchMessages(discussion.id);
                setView('messages');
              }}
            >
              <div className={styles.discussionInfo}>
                <div className={styles.discussionTitle}>
                  {discussion.title}
                </div>
                <p className={styles.discussionPreview}>
                  {discussion.content.substring(0, 100)}...
                </p>
                <div className={styles.discussionMeta}>
                  <span className={styles.discussionAuthor}>
                    <FaUser /> {discussion.author_name}
                  </span>
                  <span className={styles.discussionDate}>
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                  <span className={styles.discussionComments}>
                    <FaComments /> {discussion.message_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMessagesView = () => (
    <div className={styles.messageContainer}>
      <button
        className={styles.backButton}
        onClick={() => {
          setSelectedDiscussion(null);
          setView('discussions');
        }}
      >
        <FaArrowLeft /> Volver a discusiones
      </button>

      <h2 className={styles.discussionTitle}>{selectedDiscussion?.title}</h2>

      <div className={styles.messageList}>
        {loading ? (
          <div className={styles.loading}>Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay mensajes en esta discusión aún.</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`${styles.messageItem} ${message.user_id === parseInt(localStorage.getItem('userId')) ? styles.ownMessage : ''}`}
            >
              <div className={styles.messageHeader}>
                <div className={styles.messageAuthor}>
                  <FaUser /> {message.author_name}
                </div>
                <div className={styles.messageDate}>
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>

              {editingMessage?.id === message.id ? (
                <div className={styles.editForm}>
                  <textarea
                    value={editingMessage.content}
                    onChange={(e) => setEditingMessage({
                      ...editingMessage,
                      content: e.target.value
                    })}
                  />
                  <div className={styles.editActions}>
                    <button onClick={() => setEditingMessage(null)}>
                      Cancelar
                    </button>
                    <button onClick={handleUpdateMessage}>
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              )}

              {message.user_id === parseInt(localStorage.getItem('userId')) && !editingMessage && (
                <div className={styles.messageActions}>
                  <button
                    onClick={() => setEditingMessage({
                      id: message.id,
                      content: message.content
                    })}
                    className={styles.editButton}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows="3"
          required
        />
        <button type="submit">
          <FaPaperPlane /> Enviar
        </button>
      </form>
    </div>
  );

  const renderNotificationsView = () => (
    <div className={styles.notificationsContainer}>
      <button
        className={styles.backButton}
        onClick={() => setView('groups')}
      >
        <FaArrowLeft /> Volver al foro
      </button>

      <div className={styles.notificationsHeader}>
        <h2>
          <FaBell /> Notificaciones
        </h2>
        <div className={styles.notificationsActions}>
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={styles.toggleButton}
          >
            {showUnreadOnly ? <FaBellSlash /> : <FaBell />}
            {showUnreadOnly ? 'Mostrar todas' : 'Mostrar no leídas'}
          </button>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className={styles.markAllButton}
            >
              <FaCheck /> Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando notificaciones...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay notificaciones {showUnreadOnly ? 'no leídas' : ''}.</p>
        </div>
      ) : (
        <div className={styles.notificationsList}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
            >
              <div
                className={styles.notificationContent}
                onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
              >
                {notification.content}
                <span className={styles.notificationDate}>
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notification.id);
                  }}
                  className={styles.markAsReadButton}
                  title="Marcar como leída"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Renderizado principal
  return (
    <div className={styles.foroContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <FaBook /> Foro Universitario Maya
        </h1>
        <p className={styles.subtitle}>
          Conectando estudiantes interesados en la cultura maya
        </p>

        {view !== 'notifications' && (
          <button
            className={styles.notificationsButton}
            onClick={() => {
              setView('notifications');
              fetchNotifications();
            }}
          >
            <FaBell /> Notificaciones
          </button>
        )}
      </header>

      <div className={styles.mainContent}>
        {view === 'groups' && (
          <>
            <div className={styles.sidebar}>
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>Menú</h3>
                <ul className={styles.menuList}>
                  <li
                    className={`${styles.menuItem} ${activeTab === 'grupos' ? styles.active : ''}`}
                    onClick={() => setActiveTab('grupos')}
                  >
                    <MdGroups /> Grupos
                  </li>
                  <li
                    className={`${styles.menuItem} ${activeTab === 'nuevos' ? styles.active : ''}`}
                    onClick={() => setActiveTab('nuevos')}
                  >
                    <MdNewReleases /> Nuevos
                  </li>
                  <li
                    className={`${styles.menuItem} ${activeTab === 'populares' ? styles.active : ''}`}
                    onClick={() => setActiveTab('populares')}
                  >
                    <MdTrendingUp /> Populares
                  </li>
                </ul>
              </div>

              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>Universidades</h3>
                <ul className={styles.universityList}>
                  {universities.map((uni, index) => (
                    <li
                      key={index}
                      className={styles.universityItem}
                      onClick={() => setSearchQuery(uni)}
                    >
                      <FaUniversity /> {uni}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.toolbar}>
                <div className={styles.searchBar}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar grupos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <button
                  className={styles.createButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus /> Crear Grupo
                </button>
              </div>

              {error && <div className={styles.errorAlert}>{error}</div>}

              {renderGroupsView()}
            </div>
          </>
        )}

        {view === 'discussions' && renderDiscussionsView()}
        {view === 'messages' && renderMessagesView()}
        {view === 'notifications' && renderNotificationsView()}
      </div>

      {/* Modal para crear nuevo grupo */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setShowCreateModal(false)}
            >
              &times;
            </button>
            <h2 className={styles.modalTitle}>Crear nuevo grupo</h2>
            <form onSubmit={handleCreateGroup} className={styles.groupForm}>
              <div className={styles.formGroup}>
                <label htmlFor="groupName">Nombre del grupo</label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                  placeholder="Ej: Estudios Mayas UNAM"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="university">Universidad</label>
                <select
                  id="university"
                  value={newGroup.university}
                  onChange={(e) => setNewGroup({ ...newGroup, university: e.target.value })}
                  required
                >
                  <option value="">Selecciona una universidad</option>
                  {universities.map((uni, index) => (
                    <option key={index} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  required
                  placeholder="Describe el propósito de este grupo..."
                  rows="4"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
                  />
                  <span className={styles.checkboxCustom}></span>
                  Grupo público (cualquiera puede unirse)
                </label>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  Crear grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foro;
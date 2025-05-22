import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaUniversity, FaUsers, FaSearch, FaPlus, FaBook, FaComments,
  FaStar, FaPaperPlane, FaArrowLeft
} from 'react-icons/fa';
import { MdGroups, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import api from '../api/api';
import styles from '../styles/Foro.module.css';
import socket from '../socket';

const Foro = () => {
  // Estados y referencias
  const [activeTab, setActiveTab] = useState('grupos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    university: '',
    description: '',
    isPublic: true
  });
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Universidades disponibles
  const universities = [
    'UNAM', 'UADY', 'Universidad Autónoma de Campeche',
    'Universidad de Quintana Roo', 'Universidad Autónoma de Chiapas'
  ];

  // Configuración de Socket.io
  useEffect(() => {
    api.connectSocket();
    socketRef.current = api.socket;

    const handleNewMessage = (newMessage) => {
      setGroupMessages(prev => [...prev, newMessage]);
    };

    socketRef.current.on('messageReceived', handleNewMessage);

  }, []);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  // Obtener grupos
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { search: searchQuery.trim() };
      if (activeTab === 'populares') params.tab = 'populares';

      const response = await api.get('/forum/groups', { params });
      setGroups(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Error al cargar grupos');
      console.error('Error fetching groups:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  // Obtener mensajes del grupo
  const fetchGroupMessages = useCallback(async (groupId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/forum/groups/${groupId}/messages`);
      setGroupMessages(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Error al cargar mensajes');
      console.error('Error fetching messages:', err);
      setGroupMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar selección de grupo
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
      api.joinGroup(selectedGroup.id);
    }
  }, [selectedGroup, fetchGroupMessages]);

  // Manejar vista de grupos
  useEffect(() => {
    if (view === 'groups') {
      fetchGroups();
    }
  }, [view, fetchGroups]);

  // Crear grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/groups', newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', university: '', description: '', isPublic: true });
      fetchGroups();
    } catch (err) {
      setError(err.message || 'Error al crear grupo');
    }
  };

  // Unirse a grupo
  const handleJoinGroup = async (groupId, e) => {
    e?.stopPropagation();
    try {
      await api.post(`/forum/groups/${groupId}/join`);
      setGroups(groups.map(group => 
        group.id === groupId ? { ...group, members: group.members + 1 } : group
      ));
    } catch (err) {
      setError(err.message || 'Error al unirse al grupo');
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        groupId: selectedGroup.id,
        content: newMessage,
        userId: parseInt(localStorage.getItem('userId'))
      };
      api.sendMessage(messageData);
      setNewMessage('');
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Efectos secundarios
  useEffect(() => {
    if (view === 'groups') {
      fetchGroups();
    }
  }, [view, fetchGroups]);

  useEffect(() => {
    socket.on('messageReceived', (msg) => {
      setGroupMessages(prev => [...prev, msg]);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.io error:', err);
    });

    return () => {
      socket.off('messageReceived');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      // Cargar los mensajes al abrir el grupo
      fetchGroupMessages(selectedGroup.id);

      // Unirse a la sala del grupo
      if (socket.connected) {
        socket.emit('joinGroup', selectedGroup.id);
      } else {
        socket.connect();
        socket.on('connect', () => {
          socket.emit('joinGroup', selectedGroup.id);
        });
      }
    }
  }, [selectedGroup]);

  // Renderizado de la vista de grupos
  const renderGroupsView = () => (
    <div className={styles.groupsContainer}>
      <h2 className={styles.sectionTitle}>
        {activeTab === 'grupos' && 'Todos los grupos'}
        {activeTab === 'nuevos' && 'Grupos recientes'}
        {activeTab === 'populares' && 'Grupos populares'}
      </h2>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando grupos...</div>
      ) : groups.length > 0 ? (
        <div className={styles.groupsGrid}>
          {groups.map(group => (
            <div
              key={group.id}
              className={`${styles.groupCard} ${group.is_featured ? styles.featured : ''}`}
              onClick={() => {
                setSelectedGroup(group);
                setView('chat');
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
                  <FaComments /> {group.messages} mensajes
                </div>
              </div>
              <div className={styles.groupFooter}>
                <span className={styles.lastActivity}>{group.lastActivity}</span>
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
      ) : (
        <div className={styles.emptyState}>
          <p>No se encontraron grupos</p>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Crear primer grupo
          </button>
        </div>
      )}
    </div>
  );

  // Renderizado del chat de grupo
  const renderGroupChat = () => (
    <div className={styles.groupChatContainer}>
      <button
        className={styles.backButton}
        onClick={() => {
          setSelectedGroup(null);
          setView('groups');
        }}
      >
        <FaArrowLeft /> Volver a grupos
      </button>

      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>
          <MdGroups /> {selectedGroup?.name}
        </h2>
        <p className={styles.groupDescription}>{selectedGroup?.description}</p>
      </div>

      <div className={styles.messagesContainer}>
        {loading ? (
          <div className={styles.loading}>Cargando mensajes...</div>
        ) : groupMessages.length > 0 ? (
          groupMessages.map(message => (
            <div
              key={`${message.id}_${message.created_at}`} // Combina ID y timestamp para garantizar unicidad
              className={`${styles.message} ${message.user_id === parseInt(localStorage.getItem('userId'))
                  ? styles.ownMessage
                  : styles.otherMessage
                }`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.sender}>
                  {message.user_id === parseInt(localStorage.getItem('userId'))
                    ? 'Tú'
                    : message.author_name}
                </span>
                <span className={styles.time}>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No hay mensajes en este grupo aún. ¡Envía el primero!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          rows="2"
          required
        />
        <button type="submit">
          <FaPaperPlane /> Enviar
        </button>
      </form>
    </div>
  );

  return (
    <div className={styles.foroContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <FaBook /> Foro Universitario Maya
        </h1>
        <p className={styles.subtitle}>
          Conectando estudiantes interesados en la cultura maya
        </p>
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
                      onClick={() => {
                        setSearchQuery(uni);
                        setActiveTab('grupos');
                      }}
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
                    onKeyPress={(e) => e.key === 'Enter' && fetchGroups()}
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

              {renderGroupsView()}
            </div>
          </>
        )}

        {view === 'chat' && renderGroupChat()}
      </div>

      {/* Modal para crear grupo */}
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
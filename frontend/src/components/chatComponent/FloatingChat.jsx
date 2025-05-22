import { useState, useEffect, useRef, useCallback } from 'react';
import { FaComments, FaTimes, FaChevronDown, FaPaperPlane, FaCircle } from 'react-icons/fa';
import api from '../../api/api';
import styles from './FloatingChat.module.css';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState({
    groups: true,
    messages: false,
    sending: false
  });
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Obtener grupos del usuario
  const fetchUserGroups = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, groups: true }));
      setError(null);
      const response = await api.get('/forum/user/groups');
      setUserGroups(response || []);

      // Inicializar contadores de no leídos
      const counts = {};
      response.forEach(group => {
        counts[group.id] = group.unreadCount || 0;
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setError('Error al cargar tus grupos');
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  }, []);

  // Obtener mensajes del grupo
  const fetchGroupMessages = useCallback(async (groupId) => {
    if (!groupId) return;

    try {
      setIsLoading(prev => ({ ...prev, messages: true }));
      setError(null);
      const response = await api.get(`/forum/groups/${groupId}/messages`);
      setMessages(response || []);

      // Marcar mensajes como leídos
      await api.put(`/forum/groups/${groupId}/mark-read`);

      // Actualizar contador de no leídos
      setUnreadCounts(prev => ({ ...prev, [groupId]: 0 }));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error al cargar mensajes');
    } finally {
      setIsLoading(prev => ({ ...prev, messages: false }));
    }
  }, []);

  // Configurar Socket.io - Manejador de mensajes
  useEffect(() => {
    const handleMessageReceived = (newMessage) => {
      // Reemplazar mensaje optimista si existe
      setMessages(prev => {
        const filtered = prev.filter(msg =>
          !msg.isOptimistic ||
          (msg.isOptimistic && msg.user_id !== newMessage.user_id)
        );
        return [...filtered, newMessage];
      });

      // Actualizar lista de grupos
      setUserGroups(prev => prev.map(group => {
        if (group.id === newMessage.group_id) {
          return {
            ...group,
            lastMessage: { content: newMessage.content },
            lastActivity: new Date().toISOString()
          };
        }
        return group;
      }));

      // Actualizar contador de no leídos si no estamos en el grupo activo
      if (!activeGroup || activeGroup.id !== newMessage.group_id) {
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.group_id]: (prev[newMessage.group_id] || 0) + 1
        }));
      }
    };

      api.socket.on('messageReceived', handleMessageReceived);
  return () => api.socket.off('messageReceived', handleMessageReceived);
}, [activeGroup]);

  // Inicializar chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setError(null);

        // Primero cargar grupos (HTTP)
        await fetchUserGroups();

        // Luego conectar socket
        api.connectSocket();

        // Esperar conexión del socket
        await new Promise((resolve, reject) => {
          const checkConnection = () => {
            if (api.socket.connected) resolve();
            else setTimeout(checkConnection, 100);
          };

          setTimeout(() => {
            if (!api.socket.connected) reject(new Error('Timeout connecting socket'));
          }, 3000);

          checkConnection();
        });

      } catch (err) {
        console.error('Initialization error:', err);
        setError('Error al inicializar el chat. Por favor reintente.');
      }
    };

    initializeChat();

    return () => {
      api.disconnectSocket();
    };
  }, [fetchUserGroups]);

  // Cargar mensajes cuando se selecciona un grupo
  useEffect(() => {
    if (activeGroup) {
      fetchGroupMessages(activeGroup.id);
      api.joinGroup(activeGroup.id);
    }
  }, [activeGroup, fetchGroupMessages]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesEndRef.current.parentElement;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150;

      if (isNearBottom || !container.scrollTop) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }, 100);
      }
    }
  }, [messages, activeGroup]);

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup || isLoading.sending) return;

    try {
      setIsLoading(prev => ({ ...prev, sending: true }));
      setError(null);

      const messageData = {
        groupId: activeGroup.id,
        content: newMessage.trim()
      };

      // Enviar mensaje a través de Socket.io
      api.sendMessage(messageData);

      // Actualización optimista
      const tempId = Date.now();
      const userId = parseInt(localStorage.getItem('userId'));

      setMessages(prev => [...prev, {
        id: tempId,
        group_id: activeGroup.id,
        user_id: userId,
        content: messageData.content,
        created_at: new Date().toISOString(),
        author_name: 'Tú',
        isOptimistic: true
      }]);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar mensaje');
    } finally {
      setIsLoading(prev => ({ ...prev, sending: false }));
    }
  };

  // Calcular total de mensajes no leídos
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // Formatear fecha del último mensaje
  const formatLastActivity = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={styles.floatingChatContainer}>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          className={styles.chatToggleButton}
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
          data-unread={totalUnread > 0}
        >
          <FaComments size={24} />
          {totalUnread > 0 && (
            <span className={styles.unreadCount}>
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <h3>Chats de Grupos</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.chatContent}>
            {!activeGroup ? (
              <div className={styles.groupList}>
                <h4>Tus grupos</h4>
                {isLoading.groups ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    Cargando grupos...
                  </div>
                ) : error ? (
                  <div className={styles.error}>
                    {error}
                    <button
                      onClick={fetchUserGroups}
                      className={styles.retryButton}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : userGroups.length > 0 ? (
                  <ul>
                    {userGroups.map(group => (
                      <li
                        key={group.id}
                        className={`${styles.groupItem} ${unreadCounts[group.id] > 0 ? styles.hasUnread : ''}`}
                        onClick={() => setActiveGroup(group)}
                      >
                        <div className={styles.groupAvatar}>
                          {group.name.charAt(0).toUpperCase()}
                          {unreadCounts[group.id] > 0 && (
                            <span className={styles.groupUnreadIndicator}></span>
                          )}
                        </div>
                        <div className={styles.groupInfo}>
                          <div className={styles.groupNameRow}>
                            <span className={styles.groupName}>{group.name}</span>
                            <span className={styles.groupLastActivity}>
                              {formatLastActivity(group.lastActivity)}
                            </span>
                          </div>
                          <div className={styles.groupLastMessageRow}>
                            <span className={styles.lastMessage}>
                              {group.lastMessage?.content || 'No hay mensajes'}
                            </span>
                            {unreadCounts[group.id] > 0 && (
                              <span className={styles.groupUnreadCount}>
                                {unreadCounts[group.id] > 9 ? '9+' : unreadCounts[group.id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    No perteneces a ningún grupo aún
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.chatWindow}>
                <div className={styles.chatHeader}>
                  <button
                    className={styles.backButton}
                    onClick={() => setActiveGroup(null)}
                    aria-label="Volver a lista de grupos"
                  >
                    <FaChevronDown />
                  </button>
                  <div className={styles.groupHeaderInfo}>
                    <h4>{activeGroup.name}</h4>
                    <span className={styles.groupMembers}>
                      {activeGroup.members} miembros
                    </span>
                  </div>
                </div>

                <div className={styles.messagesContainer}>
                  {isLoading.messages ? (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      Cargando mensajes...
                    </div>
                  ) : error ? (
                    <div className={styles.error}>
                      {error}
                      <button
                        onClick={() => fetchGroupMessages(activeGroup.id)}
                        className={styles.retryButton}
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={message.id || `temp-${index}`}
                        className={`${styles.message} ${message.user_id === parseInt(localStorage.getItem('userId'))
                            ? styles.ownMessage
                            : styles.otherMessage
                          } ${message.isOptimistic ? styles.optimistic : ''}`}
                      >
                        {message.user_id !== parseInt(localStorage.getItem('userId')) && (
                          <div className={styles.messageAvatar}>
                            {message.author_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className={styles.messageContent}>
                          {message.user_id !== parseInt(localStorage.getItem('userId')) && (
                            <span className={styles.senderName}>
                              {message.author_name || 'Usuario'}
                            </span>
                          )}
                          <div className={styles.messageText}>{message.content}</div>
                          <span className={styles.messageTime}>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {message.isOptimistic && (
                              <span className={styles.sendingIndicator}>
                                <FaCircle size={8} />
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      No hay mensajes en este grupo aún. ¡Envía el primero!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.messageForm}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className={styles.messageInput}
                    disabled={isLoading.sending}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!newMessage.trim() || isLoading.sending}
                    aria-label="Enviar mensaje"
                  >
                    {isLoading.sending ? (
                      <div className={styles.sendingSpinner}></div>
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
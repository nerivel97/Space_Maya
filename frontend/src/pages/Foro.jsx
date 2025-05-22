import { useState, useEffect, useCallback } from 'react';
import {
  FaUniversity, FaUsers, FaSearch, FaPlus, FaBook, FaStar, FaComments
} from 'react-icons/fa';
import { MdGroups, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import api from '../api/api';
import styles from '../styles/Foro.module.css';

const Foro = () => {
  // Estados
  const [activeTab, setActiveTab] = useState('grupos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    university: '',
    description: '',
    isPublic: true
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Universidades disponibles
  const universities = [
    'UNAM', 'UADY', 'Universidad Autónoma de Campeche',
    'Universidad de Quintana Roo', 'Universidad Autónoma de Chiapas'
  ];

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

  // Efecto para cargar grupos al inicio y cuando cambian los parámetros
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
                        onClick={(e) => handleJoinGroup(group.id, e)}
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
        </div>
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
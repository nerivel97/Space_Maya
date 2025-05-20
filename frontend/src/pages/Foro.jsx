import { useState, useEffect } from 'react';
import { FaUniversity, FaUsers, FaSearch, FaPlus, FaBook, FaComments, FaStar, FaRegStar, FaEllipsisH } from 'react-icons/fa';
import { MdGroups, MdNewReleases, MdTrendingUp } from 'react-icons/md';
import styles from '../styles/Foro.module.css';

const Foro = () => {
  const [activeTab, setActiveTab] = useState('grupos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    university: '',
    description: '',
    isPublic: true
  });

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  // Datos de ejemplo
  const universities = [
    'UNAM', 'UADY', 'Universidad Autónoma de Campeche', 
    'Universidad de Quintana Roo', 'Universidad Autónoma de Chiapas'
  ];

  const sampleGroups = [
    {
      id: 1,
      name: 'Estudios Mayas UNAM',
      university: 'UNAM',
      members: 245,
      discussions: 56,
      description: 'Grupo para estudiantes de la UNAM interesados en la cultura maya',
      isFeatured: true,
      lastActivity: 'Hace 2 horas'
    },
    {
      id: 2,
      name: 'Arqueología Maya UADY',
      university: 'UADY',
      members: 178,
      discussions: 32,
      description: 'Discusiones sobre hallazgos arqueológicos mayas en Yucatán',
      isFeatured: false,
      lastActivity: 'Hace 1 día'
    },
    {
      id: 3,
      name: 'ITC CANCÚN QROO',
      university: 'Instituto Tecnologico de Cancún',
      members: 89,
      discussions: 24,
      description: 'Aprendizaje y práctica de las lenguas mayas actuales',
      isFeatured: true,
      lastActivity: 'Hace 3 días'
    },
    {
      id: 4,
      name: 'Matemáticas Mayas',
      university: 'Universidad Autónoma de Campeche',
      members: 112,
      discussions: 18,
      description: 'Estudio del sistema matemático y calendárico maya',
      isFeatured: false,
      lastActivity: 'Hace 5 días'
    }
  ];

  const filteredGroups = sampleGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el grupo
    console.log('Nuevo grupo:', newGroup);
    setShowCreateModal(false);
    setNewGroup({
      name: '',
      university: '',
      description: '',
      isPublic: true
    });
  };

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
                <li key={index} className={styles.universityItem}>
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

          <div className={styles.groupsContainer}>
            <h2 className={styles.sectionTitle}>
              {activeTab === 'grupos' && 'Todos los grupos'}
              {activeTab === 'nuevos' && 'Grupos recientes'}
              {activeTab === 'populares' && 'Grupos populares'}
            </h2>

            {filteredGroups.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No se encontraron grupos que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <div className={styles.groupsGrid}>
                {filteredGroups.map(group => (
                  <div 
                    key={group.id} 
                    className={`${styles.groupCard} ${group.isFeatured ? styles.featured : ''}`}
                  >
                    {group.isFeatured && (
                      <div className={styles.featuredBadge}>
                        <FaStar /> Destacado
                      </div>
                    )}
                    <div className={styles.groupHeader}>
                      <h3 className={styles.groupName}>{group.name}</h3>
                      <button className={styles.groupOptions}>
                        <FaEllipsisH />
                      </button>
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
                      <span className={styles.lastActivity}>{group.lastActivity}</span>
                      <button className={styles.joinButton}>
                        Unirse al grupo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  required
                  placeholder="Ej: Estudios Mayas UNAM"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="university">Universidad</label>
                <select
                  id="university"
                  value={newGroup.university}
                  onChange={(e) => setNewGroup({...newGroup, university: e.target.value})}
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
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
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
                    onChange={(e) => setNewGroup({...newGroup, isPublic: e.target.checked})}
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
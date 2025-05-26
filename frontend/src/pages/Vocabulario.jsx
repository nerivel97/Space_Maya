import React, { useState, useEffect } from 'react';
import styles from '../styles/Vocabulario.module.css';
import { 
  FaSearch, 
  FaLanguage,
  FaVolumeUp,
  FaLanguage as FaSpanish
} from 'react-icons/fa';
import api from '../api/api';

const Vocabulario = () => {
  const [vocabulario, setVocabulario] = useState([]);
  const [filteredVocabulario, setFilteredVocabulario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categoria: '',
    searchTerm: ''
  });
  const [openedCard, setOpenedCard] = useState(null);

  const categories = ['Sustantivo', 'Verbo', 'Adjetivo', 'Frase', 'Otro'];

  const fetchVocabulario = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vocabulario');
      setVocabulario(response.data);
      setFilteredVocabulario(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el vocabulario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...vocabulario];
    
    if (filters.categoria) {
      filtered = filtered.filter(item => item.categoria === filters.categoria);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.palabra_espanol.toLowerCase().includes(term) || 
        item.palabra_maya.toLowerCase().includes(term)
      );
    }
    
    setFilteredVocabulario(filtered);
  }, [filters, vocabulario]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'es-MX';
    window.speechSynthesis.speak(utterance);
  };

  const toggleCard = (id) => {
    setOpenedCard(prev => prev === id ? null : id);
  };

  useEffect(() => {
    fetchVocabulario();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <FaLanguage className={styles.titleIcon} /> Vocabulario Maya
          <span className={styles.subtitle}>Haz clic en las tarjetas para abrirlas</span>
        </h1>
        
        {error && <div className={styles.error}>{error}</div>}
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            name="searchTerm"
            placeholder="Buscar palabras..."
            value={filters.searchTerm}
            onChange={handleFilterChange}
            className={styles.searchInput}
          />
        </div>

        <select
          name="categoria"
          value={filters.categoria}
          onChange={handleFilterChange}
          className={styles.categoryFilter}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando vocabulario...</p>
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          {filteredVocabulario.length > 0 ? (
            filteredVocabulario.map(item => (
              <div 
                key={item.id} 
                className={styles.book}
                onClick={() => toggleCard(item.id)}
              >
                {/* Contenido principal (interior del libro) */}
                <div className={styles.bookContent}>
                  {item.imagen_url && (
                    <div className={styles.cardImageContainer}>
                      <img
                        src={`http://localhost:5000${item.imagen_url}`}
                        alt={item.palabra_espanol}
                        className={styles.cardImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.contentDetails}>
                    <h3 className={styles.spanishWord}>
                      <FaSpanish /> {item.palabra_espanol}
                    </h3>
                    {item.significado && (
                      <div className={styles.meaning}>
                        <p>{item.significado}</p>
                      </div>
                    )}
                    {(item.ejemplo_uso_espanol || item.ejemplo_uso_maya) && (
                      <div className={styles.examples}>
                        <h4>Ejemplos:</h4>
                        {item.ejemplo_uso_espanol && (
                          <p className={styles.example}>{item.ejemplo_uso_espanol}</p>
                        )}
                        {item.ejemplo_uso_maya && (
                          <p className={`${styles.example} ${styles.mayaText}`}>
                            {item.ejemplo_uso_maya}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Portada del libro (se abre al hacer clic) */}
                <div className={`${styles.cover} ${openedCard === item.id ? styles.coverOpen : ''}`}>
                  <div className={styles.coverContent}>
                    <h3 className={styles.mayaWord}>{item.palabra_maya}</h3>
                    <span className={`${styles.categoryBadge} ${styles[item.categoria.toLowerCase()]}`}>
                      {item.categoria}
                    </span>
                    {item.pronunciacion && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(item.pronunciacion);
                        }}
                        className={styles.pronounceButton}
                      >
                        <FaVolumeUp /> {item.pronunciacion}
                      </button>
                    )}
                    <div className={styles.clickHint}>
                      <span>Haz clic para abrir</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              No se encontraron palabras con los filtros actuales
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Vocabulario;
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import styles from '../styles/Miandle.module.css';
import { FaSearch } from "react-icons/fa";

const Miandle = () => {
    // Estados principales
    const [myths, setMyths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [sortOption, setSortOption] = useState('recientes');
    
    // Estados para vista detallada
    const [selectedMyth, setSelectedMyth] = useState(null);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const mythsPerPage = 6;
    
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    // Obtener mitos al cargar el componente
    useEffect(() => {
        fetchMyths();
    }, []);

    // Obtener mitos desde la API
    const fetchMyths = async () => {
        try {
            setLoading(true);
            const response = await api.get('/myths');
            setMyths(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching myths:', err);
            setError('Error al cargar mitos y leyendas');
            setLoading(false);
        }
    };

    // Filtrar y ordenar mitos
    const filteredMyths = myths.filter(myth => {
        const matchesSearch = myth.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            myth.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || myth.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortOption === 'recientes') return b.id - a.id;
        if (sortOption === 'antiguos') return a.id - b.id;
        if (sortOption === 'titulo') return a.title.localeCompare(b.title);
        return 0;
    });

    // Paginación
    const indexOfLastMyth = currentPage * mythsPerPage;
    const indexOfFirstMyth = indexOfLastMyth - mythsPerPage;
    const currentMyths = filteredMyths.slice(indexOfFirstMyth, indexOfLastMyth);

    return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Mitos y Leyendas</h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {/* Controles de filtrado y búsqueda */}
                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Buscar mitos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.searchIcon}><FaSearch /></span>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Categoría:</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Todas">Todas</option>
                            <option value="Mito">Mito</option>
                            <option value="Leyenda">Leyenda</option>
                            <option value="Fábula">Fábula</option>
                            <option value="Tradición">Tradición</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Ordenar por:</label>
                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="recientes">Más recientes</option>
                            <option value="antiguos">Más antiguos</option>
                            <option value="titulo">Título (A-Z)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner}></div>
                    </div>
                ) : (
                    <>
                        <div className={styles.grid}>
                            {currentMyths.map(myth => (
                                <div key={myth.id} className={styles.card}>
                                    {myth.featured_image && (
                                        <img
                                            src={`http://localhost:5000${myth.featured_image}`}
                                            alt={myth.title}
                                            className={styles.cardImage}
                                            onClick={() => setSelectedMyth(myth)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    )}
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.cardTitle}>{myth.title}</h3>
                                        <span className={styles.cardCategory}>{myth.category}</span>
                                        <p className={styles.cardOrigin}>
                                            <strong>Origen:</strong> {myth.origin_region}, {myth.origin_culture}
                                        </p>
                                        <p className={styles.cardContent}>
                                            {myth.content.substring(0, 100)}...
                                        </p>
                                        <div className={styles.cardActions}>
                                            <button 
                                                className={styles.viewButton}
                                                onClick={() => setSelectedMyth(myth)}
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                        {myth.is_verified && (
                                            <span className={styles.verifiedBadge}>✓ Verificado</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginación */}
                        {filteredMyths.length > mythsPerPage && (
                            <div className={styles.pagination}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>
                                
                                <span>Página {currentPage} de {Math.ceil(filteredMyths.length / mythsPerPage)}</span>
                                
                                <button 
                                    onClick={() => setCurrentPage(prev => 
                                        Math.min(prev + 1, Math.ceil(filteredMyths.length / mythsPerPage))
                                    )}
                                    disabled={currentPage === Math.ceil(filteredMyths.length / mythsPerPage)}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal de detalles */}
                {selectedMyth && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedMyth(null)}>
                        <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{selectedMyth.title}</h2>
                                <button className={styles.closeButton} onClick={() => setSelectedMyth(null)}>
                                    &times;
                                </button>
                            </div>
                            
                            <div className={styles.modalBody}>
                                {selectedMyth.featured_image && (
                                    <img 
                                        src={`http://localhost:5000${selectedMyth.featured_image}`} 
                                        alt={selectedMyth.title}
                                        className={styles.detailImage}
                                    />
                                )}
                                
                                <div className={styles.metaInfo}>
                                    <span className={styles.categoryBadge}>{selectedMyth.category}</span>
                                    {selectedMyth.is_verified && (
                                        <span className={styles.verifiedBadge}>✓ Verificado</span>
                                    )}
                                    <p><strong>Origen:</strong> {selectedMyth.origin_region}, {selectedMyth.origin_culture}</p>
                                    {selectedMyth.estimated_origin_year && (
                                        <p><strong>Época:</strong> {selectedMyth.estimated_origin_year}</p>
                                    )}
                                </div>
                                
                                <div className={styles.content}>
                                    {selectedMyth.content.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default Miandle;
import React, { useState, useEffect } from 'react';
import styles from '../../../styles/admin/VocabularioPanel.module.css';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaSave,
    FaImage,
    FaLanguage,
    FaVolumeUp
} from 'react-icons/fa';
import api from '../../../api/api';

const VocabularioPanel = () => {
    // Estados
    const [vocabulario, setVocabulario] = useState([]);
    const [filteredVocabulario, setFilteredVocabulario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        palabra_espanol: '',
        palabra_maya: '',
        pronunciacion: '',
        categoria: 'Sustantivo',
        significado: '',
        ejemplo_uso_espanol: '',
        ejemplo_uso_maya: '',
        imagen_url: ''
    });
    const [filters, setFilters] = useState({
        categoria: '',
        searchTerm: ''
    });
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ['Sustantivo', 'Verbo', 'Adjetivo', 'Frase', 'Otro'];

    // Obtener vocabulario
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

    // Aplicar filtros
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

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Manejar cambios en el formulario
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Subir imagen
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mostrar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/vocabulario/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                imagen_url: response.data.imageUrl
            }));
        } catch (err) {
            setError('Error al subir la imagen');
            console.error(err);
        }
    };

    // Abrir modal para editar/crear
    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : {
            palabra_espanol: '',
            palabra_maya: '',
            pronunciacion: '',
            categoria: 'Sustantivo',
            significado: '',
            ejemplo_uso_espanol: '',
            ejemplo_uso_maya: '',
            imagen_url: ''
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    // Cerrar modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setImagePreview(null);
    };

    // Guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await api.put(`/vocabulario/${currentItem.id}`, formData);
            } else {
                await api.post('/vocabulario', formData);
            }
            fetchVocabulario();
            closeModal();
        } catch (err) {
            setError(currentItem ? 'Error al actualizar' : 'Error al crear');
            console.error(err);
        }
    };

    // Eliminar palabra
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta palabra?')) return;

        try {
            await api.delete(`/vocabulario/${id}`);
            fetchVocabulario();
        } catch (err) {
            setError('Error al eliminar');
            console.error(err);
        }
    };

    // Pronunciar palabra
    const speakWord = (word) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'es-MX';
        window.speechSynthesis.speak(utterance);
    };

    // Cargar datos iniciales
    useEffect(() => {
        fetchVocabulario();
    }, []);

    return (
        <AdminLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <FaLanguage className={styles.titleIcon} /> Vocabulario Maya
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

                    <button
                        onClick={() => openModal()}
                        className={styles.addButton}
                    >
                        <FaPlus /> Nueva Palabra
                    </button>
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
                                <div key={item.id} className={styles.card}>
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
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardHeader}>
                                            <h3>{item.palabra_espanol}</h3>
                                            <span className={`${styles.categoryBadge} ${styles[item.categoria.toLowerCase()]}`}>
                                                {item.categoria}
                                            </span>
                                        </div>

                                        <div className={styles.mayaWord}>
                                            <span>{item.palabra_maya}</span>
                                            {item.pronunciacion && (
                                                <button
                                                    onClick={() => speakWord(item.pronunciacion)}
                                                    className={styles.pronounceButton}
                                                >
                                                    <FaVolumeUp />
                                                </button>
                                            )}
                                        </div>

                                        {item.significado && (
                                            <p className={styles.meaning}>{item.significado}</p>
                                        )}

                                        {(item.ejemplo_uso_espanol || item.ejemplo_uso_maya) && (
                                            <div className={styles.examples}>
                                                {item.ejemplo_uso_espanol && (
                                                    <p><strong>Ejemplo:</strong> {item.ejemplo_uso_espanol}</p>
                                                )}
                                                {item.ejemplo_uso_maya && (
                                                    <p className={styles.mayaText}>
                                                        <strong>Ejemplo Maya:</strong> {item.ejemplo_uso_maya}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => openModal(item)}
                                                className={styles.editButton}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className={styles.deleteButton}
                                            >
                                                <FaTrash /> Eliminar
                                            </button>
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

                {/* Modal de formulario */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2>{currentItem ? 'Editar Palabra' : 'Nueva Palabra'}</h2>
                                <button onClick={closeModal} className={styles.closeButton}>
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Palabra en Español *</label>
                                        <input
                                            type="text"
                                            name="palabra_espanol"
                                            value={formData.palabra_espanol}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Palabra en Maya *</label>
                                        <input
                                            type="text"
                                            name="palabra_maya"
                                            value={formData.palabra_maya}
                                            onChange={handleFormChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Pronunciación (ej. [kaʼan])</label>
                                        <input
                                            type="text"
                                            name="pronunciacion"
                                            value={formData.pronunciacion}
                                            onChange={handleFormChange}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Categoría *</label>
                                        <select
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label>Significado</label>
                                        <textarea
                                            name="significado"
                                            value={formData.significado}
                                            onChange={handleFormChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Ejemplo en Español</label>
                                        <textarea
                                            name="ejemplo_uso_espanol"
                                            value={formData.ejemplo_uso_espanol}
                                            onChange={handleFormChange}
                                            rows="2"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Ejemplo en Maya</label>
                                        <textarea
                                            name="ejemplo_uso_maya"
                                            value={formData.ejemplo_uso_maya}
                                            onChange={handleFormChange}
                                            rows="2"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label>Imagen</label>
                                        <div className={styles.imageUploadContainer}>
                                            <div className={styles.imagePreviewContainer}>
                                                {(imagePreview || formData.imagen_url) && (
                                                    <img
                                                        src={imagePreview || `http://localhost:5000${formData.imagen_url}`}
                                                        alt="Preview"
                                                        className={styles.imagePreview}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <label className={styles.uploadButton}>
                                                <input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                />
                                                <FaImage /> {formData.imagen_url ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                            </label>
                                            {formData.imagen_url && !imagePreview && (
                                                <span className={styles.imageName}>
                                                    {formData.imagen_url.split('/').pop()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={styles.cancelButton}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.saveButton}
                                    >
                                        <FaSave /> Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default VocabularioPanel;
import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import AdminLayout from '../../../components/admin/AdminLayout';
import styles from '../../../styles/admin/MythPanel.module.css';

const MythPanel = () => {
    // Estados principales
    const [myths, setMyths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para el modal de formulario
    const [showModal, setShowModal] = useState(false);
    const [editingMyth, setEditingMyth] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        origin_region: '',
        origin_culture: '',
        category: 'Mito',
        estimated_origin_year: '',
        featured_image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    
    // Estados para filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [sortOption, setSortOption] = useState('recientes');
    
    // Estados para vista detallada
    const [selectedMyth, setSelectedMyth] = useState(null);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const mythsPerPage = 6;
    
    // Obtener mitos al cargar el componente
    useEffect(() => {
        fetchMyths();
    }, []);

    // Actualizar formulario cuando se edita un mito
    useEffect(() => {
        if (editingMyth) {
            setFormData({
                title: editingMyth.title,
                content: editingMyth.content,
                origin_region: editingMyth.origin_region,
                origin_culture: editingMyth.origin_culture,
                category: editingMyth.category,
                estimated_origin_year: editingMyth.estimated_origin_year || '',
                featured_image: editingMyth.featured_image || ''
            });
            setPreviewImage(editingMyth.featured_image || '');
            setIsVerified(editingMyth.is_verified || false);
        } else {
            setFormData({
                title: '',
                content: '',
                origin_region: '',
                origin_culture: '',
                category: 'Mito',
                estimated_origin_year: '',
                featured_image: ''
            });
            setPreviewImage('');
            setIsVerified(false);
        }
        setImageFile(null);
        setFormError(null);
    }, [editingMyth, showModal]);

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

    // Manejar creación de nuevo mito
    const handleCreate = () => {
        setEditingMyth(null);
        setShowModal(true);
    };

    // Manejar edición de mito
    const handleEdit = (myth) => {
        setEditingMyth(myth);
        setShowModal(true);
    };

    // Manejar eliminación de mito
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este mito/leyenda?')) {
            return;
        }

        try {
            await api.delete(`/myths/${id}`);
            setMyths(myths.filter(myth => myth.id !== id));
        } catch (err) {
            console.error('Error deleting myth:', err);
            setError('Error al eliminar el mito/leyenda');
        }
    };


    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Manejar cambio de imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Subir imagen al servidor
    const uploadImage = async () => {
        if (!imageFile) return formData.featured_image;

        try {
            const response = await api.uploadImage(imageFile, true);
            return response.data.imageUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            throw new Error('Error al subir la imagen');
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            let imageUrl = formData.featured_image;

            if (imageFile) {
                imageUrl = await uploadImage();
            }

            const dataToSubmit = {
                ...formData,
                featured_image: imageUrl,
                is_verified: isVerified
            };

            if (editingMyth) {
                await api.put(`/myths/${editingMyth.id}`, dataToSubmit);
            } else {
                await api.post('/myths', dataToSubmit);
            }

            fetchMyths();
            setShowModal(false);
        } catch (err) {
            console.error('Error submitting form:', err);
            setFormError(err.response?.data?.message || 'Error al guardar el mito/leyenda');
        } finally {
            setFormLoading(false);
        }
    };

    // Exportar a CSV
    const exportToCSV = () => {
        const headers = ['Título', 'Categoría', 'Región de Origen', 'Cultura de Origen', 'Año Estimado'];
        const data = myths.map(myth => [
            `"${myth.title}"`,
            `"${myth.category}"`,
            `"${myth.origin_region}"`,
            `"${myth.origin_culture}"`,
            `"${myth.estimated_origin_year || 'Desconocido'}"`
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + data.map(row => row.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mitos_y_leyendas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Mitos y Leyendas</h1>
                    <div className={styles.headerActions}>
                        <button className={styles.createButton} onClick={handleCreate}>
                            Crear Mito/Leyenda
                        </button>
                        <button className={styles.exportButton} onClick={exportToCSV}>
                            Exportar a CSV
                        </button>
                    </div>
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
                        <span className={styles.searchIcon}>🔍</span>
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
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => handleEdit(myth)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(myth.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
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

                {/* Modal de formulario */}
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2>{editingMyth ? 'Editar Mito/Leyenda' : 'Crear Mito/Leyenda'}</h2>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setShowModal(false)}
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                {formError && <div className={styles.formError}>{formError}</div>}

                                <div className={styles.formRow}>
                                    <div className={styles.formColumn}>
                                        <div className={styles.formGroup}>
                                            <label>Título</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Contenido</label>
                                            <textarea
                                                rows="5"
                                                name="content"
                                                value={formData.content}
                                                onChange={handleChange}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Región de origen</label>
                                                <input
                                                    type="text"
                                                    name="origin_region"
                                                    value={formData.origin_region}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Cultura de origen</label>
                                                <input
                                                    type="text"
                                                    name="origin_culture"
                                                    value={formData.origin_culture}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Categoría</label>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="Mito">Mito</option>
                                                    <option value="Leyenda">Leyenda</option>
                                                    <option value="Fábula">Fábula</option>
                                                    <option value="Tradición">Tradición</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Año de origen estimado</label>
                                                <input
                                                    type="text"
                                                    name="estimated_origin_year"
                                                    value={formData.estimated_origin_year}
                                                    onChange={handleChange}
                                                    placeholder="Ej: Siglo XV, 1500-1550, etc."
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isVerified}
                                                    onChange={(e) => setIsVerified(e.target.checked)}
                                                />
                                                Mito verificado
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.formColumn}>
                                        <div className={styles.formGroup}>
                                            <label>Imagen destacada</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            {previewImage && (
                                                <div className={styles.imagePreview}>
                                                    <img
                                                        src={previewImage.startsWith('blob:') ? previewImage : `http://localhost:5000${previewImage}`}
                                                        alt="Preview"
                                                        className={styles.previewImage}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => setShowModal(false)}
                                        disabled={formLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={formLoading}
                                    >
                                        {formLoading ? 'Guardando...' : editingMyth ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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
        </AdminLayout>
    );
};

export default MythPanel;
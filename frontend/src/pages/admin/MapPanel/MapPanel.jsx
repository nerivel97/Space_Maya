import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdminLayout from '../../../components/admin/AdminLayout';
import styles from '../../../styles/admin/MapPanel.module.css';
import api from '../../../api/api';
import ModalWrapper from '../../../pages/admin/MapPanel/ModalWrapper';
import { FaUpload, FaTimes, FaSearchPlus, FaTrash, FaEdit, FaArrowLeft } from 'react-icons/fa';

// Configuración de iconos para Leaflet
const setupLeafletIcons = () => {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  } catch (error) {
    console.error('Error configuring Leaflet icons:', error);
  }
};

setupLeafletIcons();

const MapPanel = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMarkerId, setCurrentMarkerId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    features: '',
    images: [],
    imageFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  // Cargar marcadores existentes
  useEffect(() => {
    const fetchMarkers = async () => {
      setLoading(true);
      setError(null);
      try {
        const markersData = await api.get('/markers');
        setMarkers(markersData);
      } catch (err) {
        console.error('Error loading markers:', err);
        setError(err.message || 'Error al cargar marcadores');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  // Función para agregar marcadores al mapa
  const addMarkerToMap = useCallback((marker, index) => {
    if (!mapInstance.current) return;

    const newMarker = L.marker(marker.position, {
      icon: L.divIcon({
        className: styles.customMarker,
        html: `<div class="${styles.markerContent}">${index + 1}</div>`,
        iconSize: [30, 30]
      })
    }).addTo(mapInstance.current);

    newMarker.bindPopup(`
      <b>${marker.title}</b><br>
      <small>${marker.location}</small>
      <div class="${styles.popupActions}">
        <button onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('editMarker', { detail: ${marker.id} }));">
          <i class="fas fa-edit"></i> Editar
        </button>
      </div>
    `);

    newMarker.on('click', () => {
      const foundMarker = markers.find(m => m.id === marker.id);
      if (foundMarker) {
        setSelectedMarker(foundMarker);
      }
    });

    return newMarker;
  }, [markers]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const initializeMap = () => {
      try {
        mapInstance.current = L.map(mapRef.current, {
          crs: L.CRS.Simple,
          minZoom: -1,
          maxZoom: 4,
          fullscreenControl: true
        });

        const bounds = [[0, 0], [1024, 1024]];
        const imageUrl = '/img/mapav2.png';

        L.imageOverlay(imageUrl, bounds).addTo(mapInstance.current);
        mapInstance.current.fitBounds(bounds);

        const handleMapClick = (e) => {
          setSelectedPosition([e.latlng.lat, e.latlng.lng]);
          setIsModalOpen(true);
          setIsEditMode(false);
          setSelectedMarker(null);
        };

        mapInstance.current.on('click', handleMapClick);

        window.addEventListener('editMarker', (e) => {
          const markerId = e.detail;
          const markerToEdit = markers.find(m => m.id === markerId);
          if (markerToEdit) {
            handleEditMarker(markerToEdit);
          }
        });

        return () => {
          if (mapInstance.current) {
            mapInstance.current.off('click', handleMapClick);
          }
          window.removeEventListener('editMarker', () => {});
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      }
    };

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [markers]);

  // Actualizar marcadores en el mapa
  useEffect(() => {
    if (!mapInstance.current) return;

    mapInstance.current.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    markers.forEach((marker, index) => {
      addMarkerToMap(marker, index);
    });
  }, [markers, addMarkerToMap]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar subida de imágenes
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Solo se permiten archivos de imagen');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Las imágenes no pueden ser mayores a 5MB');
        }
        return api.uploadImage(file);
      });

      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(res => res.imageUrl);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
        imageFiles: [...prev.imageFiles, ...files]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error.message || 'Error al subir imágenes');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const newImageFiles = [...prev.imageFiles];
      newImages.splice(index, 1);
      newImageFiles.splice(index, 1);
      return { ...prev, images: newImages, imageFiles: newImageFiles };
    });
  };

  // Crear nuevo marcador
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPosition) return;

    setLoading(true);
    try {
      const newMarker = {
        position: selectedPosition,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        features: formData.features.split('\n').filter(f => f.trim()),
        images: formData.images
      };

      const createdMarker = await api.post('/markers', newMarker);
      setMarkers(prev => [...prev, createdMarker]);
      resetForm();
    } catch (err) {
      console.error('Error creating marker:', err);
      setError(err.message || 'Error al crear marcador');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar marcador existente
  const handleUpdateMarker = async (e) => {
    e.preventDefault();
    if (!currentMarkerId) return;

    setLoading(true);
    try {
      const updatedMarker = {
        position: selectedPosition,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        features: formData.features.split('\n').filter(f => f.trim()),
        images: formData.images
      };

      const updated = await api.put(`/markers/${currentMarkerId}`, updatedMarker);
      setMarkers(prev => prev.map(m => m.id === currentMarkerId ? updated : m));
      resetForm();
    } catch (err) {
      console.error('Error updating marker:', err);
      setError(err.message || 'Error al actualizar marcador');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar marcador
  const handleDeleteMarker = async () => {
    if (!selectedMarker && !currentMarkerId) return;

    const markerId = selectedMarker?.id || currentMarkerId;
    setLoading(true);
    try {
      await api.delete(`/markers/${markerId}`);
      setMarkers(prev => prev.filter(m => m.id !== markerId));
      resetForm();
    } catch (err) {
      console.error('Error deleting marker:', err);
      setError(err.message || 'Error al eliminar marcador');
    } finally {
      setLoading(false);
    }
  };

  // Preparar formulario para edición
  const handleEditMarker = (marker) => {
    setFormData({
      title: marker.title,
      description: marker.description,
      location: marker.location,
      features: marker.features?.join('\n') || '',
      images: marker.images || [],
      imageFiles: []
    });
    setSelectedPosition(marker.position);
    setCurrentMarkerId(marker.id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setSelectedMarker(null);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      features: '',
      images: [],
      imageFiles: []
    });
    setSelectedPosition(null);
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentMarkerId(null);
    setError(null);
    setSelectedImage(null);
  };

  // Cerrar modal
  const closeModal = () => {
    resetForm();
  };

  // Manejar carga de imagen
  const handleImageLoad = (index) => {
    setLoadingImages(prev => ({ ...prev, [index]: false }));
  };

  // Construir URL de imagen
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  return (
    <AdminLayout>
      <div className={styles.mapPanelContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>{isEditMode ? 'Actualizando marcador...' : 'Cargando...'}</p>
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Modal para imagen ampliada */}
        {selectedImage && (
          <div className={styles.imageModalOverlay} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.alt} 
                className={styles.imageModalImg}
              />
              <button 
                className={styles.closeImageModal}
                onClick={() => setSelectedImage(null)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <div className={styles.panelLayout}>
          <div
            ref={mapRef}
            className={styles.mapContainer}
          />

          <div className={styles.controlsPanel}>
            {selectedMarker ? (
              <div className={styles.markerDetails}>
                <div className={styles.markerHeader}>
                  <h2>{selectedMarker.title}</h2>
                  <button
                    className={styles.backButton}
                    onClick={() => setSelectedMarker(null)}
                  >
                    <FaArrowLeft /> Volver
                  </button>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ubicación:</span>
                    <span className={styles.detailValue}>{selectedMarker.location}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Coordenadas:</span>
                    <span className={styles.detailValue}>
                      Lat: {selectedMarker.position[0].toFixed(4)}, Lng: {selectedMarker.position[1].toFixed(4)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Descripción:</span>
                    <p className={styles.detailValue}>{selectedMarker.description}</p>
                  </div>

                  {selectedMarker.features?.length > 0 && (
                    <div className={styles.featuresSection}>
                      <h3 className={styles.sectionTitle}>Características</h3>
                      <ul className={styles.featuresList}>
                        {selectedMarker.features.map((feature, index) => (
                          <li key={index} className={styles.featureItem}>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedMarker.images?.length > 0 && (
                    <div className={styles.gallerySection}>
                      <h3 className={styles.sectionTitle}>Galería de Imágenes</h3>
                      <div className={styles.imageGrid}>
                        {selectedMarker.images.map((imagePath, index) => {
                          const imageUrl = getImageUrl(imagePath);
                          return (
                            <div 
                              key={index} 
                              className={styles.imageCard}
                              onClick={() => setSelectedImage({
                                url: `${imageUrl}?t=${selectedMarker.updatedAt || Date.now()}`,
                                alt: `Imagen ${index + 1} de ${selectedMarker.title}`
                              })}
                            >
                              <div className={styles.imageContainer}>
                                <img
                                  src={`${imageUrl}?t=${selectedMarker.updatedAt || Date.now()}`}
                                  alt={`Imagen ${index + 1}`}
                                  className={`${styles.galleryImage} ${loadingImages[index] ? styles.imageLoading : ''}`}
                                  crossOrigin="anonymous"
                                  onLoad={() => handleImageLoad(index)}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/placeholder-image.jpg';
                                  }}
                                />
                                <div className={styles.imageOverlay}>
                                  <FaSearchPlus className={styles.zoomIcon} />
                                </div>
                              </div>
                              <div className={styles.imageInfo}>
                                <span>Imagen {index + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.markerActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditMarker(selectedMarker)}
                    disabled={loading}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      if (confirm("¿Estás seguro de eliminar este marcador?")) {
                        handleDeleteMarker();
                      }
                    }}
                    disabled={loading}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>Marcadores existentes</h2>
                {markers.length > 0 ? (
                  <div className={styles.markersList}>
                    <p className={styles.markersCount}>Total: {markers.length}</p>
                    <ul className={styles.markersContainer}>
                      {markers.map((marker, index) => (
                        <li
                          key={index}
                          onClick={() => !loading && setSelectedMarker(marker)}
                          className={styles.markerListItem}
                        >
                          <div className={styles.markerListItemContent}>
                            <span className={styles.markerTitle}>{marker.title}</span>
                            <span className={styles.markerLocation}>{marker.location}</span>
                          </div>
                          {marker.images?.length > 0 && (
                            <div className={styles.markerThumbnail}>
                              <img 
                                src={getImageUrl(marker.images[0])} 
                                alt={`Miniatura de ${marker.title}`}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className={styles.noMarkers}>
                    <p>No hay marcadores creados aún.</p>
                    <p>Haz clic en el mapa para agregar uno nuevo.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ModalWrapper
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={isEditMode ? "Editar marcador" : "Agregar nuevo marcador"}
        shouldCloseOnOverlayClick={!loading}
      >
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? "Editar marcador" : "Agregar nuevo marcador"}
          </h2>
          <p className={styles.positionInfo}>
            Posición seleccionada: {selectedPosition && `Lat: ${selectedPosition[0].toFixed(2)}, Lng: ${selectedPosition[1].toFixed(2)}`}
          </p>

          {error && (
            <div className={styles.modalError}>
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <form onSubmit={isEditMode ? handleUpdateMarker : handleSubmit} className={styles.markerForm}>
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Título:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Templo Principal"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ubicación:</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Zona Arqueológica Norte"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Descripción:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Descripción detallada del lugar..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Características (una por línea):</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="Altura: 30m\nAño construcción: 900 d.C."
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Imágenes:</label>
              <div className={styles.imageUploadContainer}>
                <label className={styles.uploadButton}>
                  <FaUpload /> Subir imágenes
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </label>
                <p className={styles.uploadHint}>Formatos aceptados: JPG, PNG, GIF. Máx. 5MB por imagen.</p>

                <div className={styles.modalImagePreviews}>
                  {formData.images.map((imageUrl, index) => {
                    const fullImageUrl = getImageUrl(imageUrl);
                    return (
                      <div key={index} className={styles.modalImagePreviewItem}>
                        <img
                          src={`${fullImageUrl}?t=${Date.now()}`}
                          alt={`Previsualización ${index + 1}`}
                          className={styles.modalImagePreview}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder-image.jpg';
                          }}
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => handleRemoveImage(index)}
                          disabled={loading}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              {isEditMode && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este marcador?")) {
                      handleDeleteMarker();
                    }
                  }}
                  disabled={loading}
                >
                  <FaTrash /> Eliminar
                </button>
              )}
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.buttonSpinner}></span>
                ) : isEditMode ? (
                  <>
                    <FaEdit /> Actualizar
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </AdminLayout>
  );
};

export default MapPanel;
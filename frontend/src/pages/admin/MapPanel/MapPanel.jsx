import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AdminLayout from '../../../components/admin/AdminLayout';
import styles from '../../../styles/admin/MapPanel.module.css';
import api from '../../../api/api';
import ModalWrapper from '../../../pages/admin/MapPanel/ModalWrapper';

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
  const [selectedMarker, setSelectedMarker] = useState(null); // Nuevo estado para el marcador seleccionado
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    features: '',
    images: ''
  });

  // Cargar marcadores existentes
  // Cargar marcadores existentes con mejor manejo de errores
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        console.log('Iniciando carga de marcadores...');
        const response = await api.get('/markers');
        console.log('Marcadores recibidos:', response.data);
        setMarkers(response.data);
      } catch (error) {
        console.error('Error completo al cargar marcadores:', error);

        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          console.error('Datos del error:', error.response.data);
          console.error('Estado del error:', error.response.status);
          console.error('Cabeceras del error:', error.response.headers);

          if (error.response.status === 401) {
            // Manejar específicamente errores de autenticación
            console.error('No autorizado - redirigiendo a login');
            // Redirigir a login si es necesario
          }
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('No se recibió respuesta del servidor');
        } else {
          // Algo pasó al configurar la solicitud
          console.error('Error al configurar la solicitud:', error.message);
        }
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

    // Popup con información básica
    newMarker.bindPopup(`
      <b>${marker.title}</b><br>
      <small>${marker.location}</small>
    `);

    // Evento para seleccionar marcador
    newMarker.on('click', () => {
      setSelectedMarker(marker);
    });

    return newMarker;
  }, []);

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
          setSelectedMarker(null); // Limpiar selección al hacer click en el mapa
        };

        mapInstance.current.on('click', handleMapClick);

        return () => {
          if (mapInstance.current) {
            mapInstance.current.off('click', handleMapClick);
          }
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
  }, []);

  // Actualizar marcadores
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPosition) return;

    try {
      const newMarker = {
        position: selectedPosition,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        features: formData.features.split('\n').filter(f => f.trim()),
        images: formData.images.split('\n').filter(url => url.trim())
      };

      const response = await api.post('/markers', newMarker);
      setMarkers(prev => [...prev, response.data]);

      setFormData({
        title: '',
        description: '',
        location: '',
        features: '',
        images: ''
      });
      setSelectedPosition(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating marker:', error);
      if (error.response?.status === 500) {
        console.error('Error del servidor al crear marcador');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  return (
    <AdminLayout>
      <div className={styles.mapPanelContainer}>
        <h1>Panel de Mapa Interactivo</h1>

        <div className={styles.panelLayout}>
          <div
            ref={mapRef}
            className={styles.mapContainer}
            style={{ height: '100%' }}
          />

          <div className={styles.controlsPanel}>
            {selectedMarker ? (
              <div className={styles.markerDetails}>
                <h2>Detalles del Marcador</h2>
                <button
                  className={styles.backButton}
                  onClick={() => setSelectedMarker(null)}
                >
                  ← Volver a la lista
                </button>

                <div className={styles.detailSection}>
                  <h3>{selectedMarker.title}</h3>
                  <p><strong>Coordenadas:</strong> Lat: {selectedMarker.position[0].toFixed(4)}, Lng: {selectedMarker.position[1].toFixed(4)}</p>
                  <p><strong>Ubicación:</strong> {selectedMarker.location}</p>
                  <p><strong>Descripción:</strong> {selectedMarker.description}</p>

                  {selectedMarker.features?.length > 0 && (
                    <div className={styles.featuresList}>
                      <h4>Características:</h4>
                      <ul>
                        {selectedMarker.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedMarker.images?.length > 0 && (
                    <div className={styles.imagesGallery}>
                      <h4>Imágenes:</h4>
                      <div className={styles.imagesContainer}>
                        {selectedMarker.images.map((imageUrl, index) => (
                          <div key={index} className={styles.imageWrapper}>
                            <img
                              src={imageUrl}
                              alt={`Imagen ${index + 1} de ${selectedMarker.title}`}
                              className={styles.markerImage}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder-image.jpg'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h2>Marcadores existentes</h2>
                {markers.length > 0 ? (
                  <div className={styles.markersList}>
                    <p>Total: {markers.length}</p>
                    <ul>
                      {markers.map((marker, index) => (
                        <li
                          key={index}
                          onClick={() => setSelectedMarker(marker)}
                          className={styles.markerListItem}
                        >
                          <strong>{marker.title}</strong> - {marker.location}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No hay marcadores creados aún. Haz clic en el mapa para agregar uno nuevo.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ModalWrapper
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Agregar nuevo marcador"
      >
        <div className={styles.modalContent}>
          <h2>Agregar nuevo marcador</h2>
          <p className={styles.positionInfo}>
            Posición seleccionada: {selectedPosition && `Lat: ${selectedPosition[0].toFixed(2)}, Lng: ${selectedPosition[1].toFixed(2)}`}
          </p>

          <form onSubmit={handleSubmit} className={styles.markerForm}>
            <div className={styles.formGroup}>
              <label>Título:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Ej: Templo Principal"
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
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descripción:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Descripción detallada del lugar..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Características (una por línea):</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="Altura: 30m\nAño construcción: 900 d.C."
              />
            </div>

            <div className={styles.formGroup}>
              <label>URLs de imágenes (una por línea):</label>
              <textarea
                name="images"
                value={formData.images}
                onChange={handleInputChange}
                required
                placeholder="https://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.saveButton}
              >
                Guardar Marcador
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </AdminLayout>
  );
};

export default MapPanel;
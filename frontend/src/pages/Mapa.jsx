import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../src/api/api';
import styles from '../styles/Mapa.module.css';
import { FaTimes, FaSearchPlus, FaMapMarkerAlt, FaInfoCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { MdDescription, MdZoomOutMap } from 'react-icons/md';

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

const Mapa = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const infoPanelRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = () => {
      try {
        mapInstance.current = L.map(mapRef.current, {
          crs: L.CRS.Simple,
          minZoom: -1,
          maxZoom: 4,
          zoomControl: true,
          fullscreenControl: true
        });

        const bounds = [[0, 0], [1024, 1024]];
        const imageUrl = '/img/mapav2.png';

        L.imageOverlay(imageUrl, bounds).addTo(mapInstance.current);
        mapInstance.current.fitBounds(bounds);

        // Agregar marcadores al mapa
        markers.forEach((marker, index) => {
          const newMarker = L.marker(marker.position, {
            icon: L.divIcon({
              className: styles.customMarker,
              html: `
                <div class="${styles.markerContent}">
                  <div class="${styles.markerPulse}"></div>
                  <div class="${styles.markerInner}">
                    <FaMapMarkerAlt />
                    <span>${index + 1}</span>
                  </div>
                </div>
              `,
              iconSize: [40, 40]
            })
          }).addTo(mapInstance.current);

          newMarker.on('click', () => {
            setSelectedMarker(marker);
            setCurrentImageIndex(0);
            infoPanelRef.current.classList.add(styles.visible);
          });
        });

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      (prev + 1) % selectedMarker.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      (prev - 1 + selectedMarker.images.length) % selectedMarker.images.length
    );
  };

  const closeInfoPanel = () => {
    setSelectedMarker(null);
    infoPanelRef.current.classList.remove(styles.visible);
  };

  return (
    <div className={styles.mapContainer}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando mapa...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <FaInfoCircle className={styles.errorIcon} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FaTimes />
          </button>
        </div>
      )}

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

      <div
        ref={mapRef}
        className={styles.leafletMap}
      />

      <div 
        ref={infoPanelRef} 
        className={styles.infoPanel}
      >
        {selectedMarker && (
          <>
            <button 
              className={styles.closeBtn}
              onClick={closeInfoPanel}
            >
              <FaTimes />
            </button>

            <div className={styles.markerHeader}>
              <div className={styles.markerTitle}>
                <FaMapMarkerAlt className={styles.markerIcon} />
                <h2>{selectedMarker.title}</h2>
              </div>
              <p className={styles.location}>
                <IoLocationSharp /> {selectedMarker.location}
              </p>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>
                  <IoLocationSharp /> Coordenadas:
                </span>
                <span className={styles.detailValue}>
                  Lat: {selectedMarker.position[0].toFixed(4)}, Lng: {selectedMarker.position[1].toFixed(4)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>
                  <MdDescription /> Descripción:
                </span>
                <p className={styles.detailValue}>{selectedMarker.description}</p>
              </div>

              {selectedMarker.features?.length > 0 && (
                <div className={styles.featuresSection}>
                  <h3 className={styles.sectionTitle}>
                    <FaInfoCircle /> Características
                  </h3>
                  <ul className={styles.featuresList}>
                    {selectedMarker.features.map((feature, index) => (
                      <li key={index} className={styles.featureItem}>
                        <FaChevronRight className={styles.featureIcon} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMarker.images?.length > 0 && (
                <div className={styles.gallerySection}>
                  <h3 className={styles.sectionTitle}>
                    <MdZoomOutMap /> Galería de Imágenes
                  </h3>
                  <div className={styles.mainImageContainer}>
                    <button 
                      className={`${styles.navButton} ${styles.prevButton}`}
                      onClick={prevImage}
                    >
                      <FaChevronLeft />
                    </button>
                    <div 
                      className={styles.mainImage}
                      onClick={() => setSelectedImage({
                        url: getImageUrl(selectedMarker.images[currentImageIndex]),
                        alt: `Imagen ${currentImageIndex + 1} de ${selectedMarker.title}`
                      })}
                    >
                      <img
                        src={getImageUrl(selectedMarker.images[currentImageIndex])}
                        alt={`Imagen principal ${currentImageIndex + 1}`}
                        className={styles.galleryImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-image.jpg';
                        }}
                      />
                      <div className={styles.imageOverlay}>
                        <FaSearchPlus className={styles.zoomIcon} />
                      </div>
                    </div>
                    <button 
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={nextImage}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                  
                  <div className={styles.thumbnailContainer}>
                    {selectedMarker.images.map((imagePath, index) => (
                      <div 
                        key={index} 
                        className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={getImageUrl(imagePath)}
                          alt={`Miniatura ${index + 1}`}
                          className={styles.thumbnailImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Mapa;
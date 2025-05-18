import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
import './Mapa.css';

export default function Mapa() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const infoPanelRef = useRef(null);

  const markers = [
    {
      id: 1,
      position: [512, 512],
      title: "Templo Principal",
      description: "El templo más importante de la ciudad maya, dedicado al dios Kukulkán.",
      images: [
        "https://imgs.search.brave.com/-Opr_pqo2qeBkMTvz_zM9F3ADR9KfZKnen_Dcw3cCB8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9oaXN0/b3JpYS5uYXRpb25h/bGdlb2dyYXBoaWMu/Y29tLmVzL21lZGlv/LzIwMjAvMDkvMzAv/ZWwtY2FzdGlsbG8t/by1waXJhbWlkZS1k/ZS1rdWt1bGNhbi1l/bi1jaGljaGVuLWl0/emFfMDRmNmY0ZTZf/ODAweDUzMy5qcGc",
        "https://imgs.search.brave.com/bRVzBS64ZZIpqtavACaxSjzhfQECPRn4oWeK4xATZ1o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9oZXlt/b25kby5lcy9ibG9n/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIz/LzA4L1BpcmFtaWRl/LUNhbGFrbXVsLVl1/Y2F0YW4tTWV4aWNv/Li5qcGc"
      ],
      location: "Zona Arqueológica Central",
      features: ["Altura: 30m", "Año de construcción: 900 d.C.", "Material: Piedra caliza"]
    },
    // ... otros marcadores
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

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

    markers.forEach(marker => {
      L.marker(marker.position, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-content">${marker.id}</div>`,
          iconSize: [30, 30]
        })
      }).addTo(mapInstance.current)
      .on('click', (e) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        setSelectedMarker(marker);
        infoPanelRef.current.classList.add('visible');
        
        const currentCenter = mapInstance.current.getCenter();
        const currentZoom = mapInstance.current.getZoom();
        
        setTimeout(() => {
          mapInstance.current.setView(currentCenter, currentZoom);
        }, 10);
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  },);

  const closeInfoPanel = () => {
    setSelectedMarker(null);
    infoPanelRef.current.classList.remove('visible');
  };

  return (
    <div className="map-container">
      <div ref={infoPanelRef} className="info-panel">
        {selectedMarker && (
          <>
            <button className="close-btn" onClick={closeInfoPanel}>
              &times;
            </button>
            <h2>{selectedMarker.title}</h2>
            <p className="location">{selectedMarker.location}</p>
            <div className="image-gallery">
              {selectedMarker.images.map((img, index) => (
                <img key={index} src={img} alt={`Vista ${index + 1} de ${selectedMarker.title}`} />
              ))}
            </div>
            <p className="description">{selectedMarker.description}</p>
            <div className="features">
              <h3>Características:</h3>
              <ul>
                {selectedMarker.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      
      <div 
        ref={mapRef} 
        className="leaflet-map"
      />
    </div>
  );
}
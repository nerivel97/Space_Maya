import Marker from '../models/Marker.js';

export const getMarkers = async (req, res) => {
  try {
    console.log('Intentando obtener marcadores...'); // Log de depuración
    const markers = await Marker.getAll();
    console.log('Marcadores obtenidos:', markers.length); // Log de depuración
    res.json(markers);
  } catch (error) {
    console.error('Error detallado al obtener marcadores:', error);
    res.status(500).json({ 
      message: 'Error al obtener marcadores',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const createMarker = async (req, res) => {
  try {
    const newMarker = await Marker.create(req.body);
    res.status(201).json(newMarker);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear marcador' });
  }
};

import Marker from '../models/Marker.js';

export const getMarkers = async (req, res) => {
  try {
    const markers = await Marker.getAll();
    res.json(markers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener marcadores' });
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
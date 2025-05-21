import Marker from '../models/Marker.js';

export const getMarkers = async (req, res) => {
  try {
    const markers = await Marker.getAll();
    res.json(markers);
  } catch (error) {
    console.error('Error getting markers:', error);
    res.status(500).json({ message: 'Error al obtener marcadores' });
  }
};

export const createMarker = async (req, res) => {
  try {
    const newMarker = await Marker.create(req.body);
    res.status(201).json(newMarker);
  } catch (error) {
    console.error('Error creating marker:', error);
    res.status(500).json({ message: 'Error al crear marcador' });
  }
};

export const updateMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMarker = await Marker.update(id, req.body);
    if (!updatedMarker) {
      return res.status(404).json({ message: 'Marcador no encontrado' });
    }
    res.json(updatedMarker);
  } catch (error) {
    console.error('Error updating marker:', error);
    res.status(500).json({ message: 'Error al actualizar marcador' });
  }
};

export const deleteMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Marker.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Marcador no encontrado' });
    }
    res.json({ message: 'Marcador eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting marker:', error);
    res.status(500).json({ message: 'Error al eliminar marcador' });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    // Aquí se procesa la ruta de la imagen para mostrarla en el frontend
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error al subir imagen' });
  }
};
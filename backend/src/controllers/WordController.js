import * as WordModel from '../models/Word.js';

const WordController = {
  async getAll(req, res) {
    try {
      const words = await WordModel.getAllWords(req.query);
      res.json({ success: true, count: words.length, data: words });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ success: false, message: 'Error al obtener palabras' });
    }
  },

  async getById(req, res) {
    try {
      const word = await WordModel.getWordById(req.params.id);
      if (!word) return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
      res.json({ success: true, data: word });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ success: false, message: 'Error al buscar palabra' });
    }
  },

  async create(req, res) {
    try {
      const { palabra_es, palabra_maya } = req.body;
      if (!palabra_es || !palabra_maya) return res.status(400).json({ success: false, message: 'Datos incompletos' });

      const newWord = await WordModel.createWord({ palabra_es, palabra_maya });
      res.status(201).json({ success: true, data: newWord, message: 'Palabra creada exitosamente' });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(400).json({ success: false, message: 'Error al crear palabra' });
    }
  },

  async update(req, res) {
    try {
      const updatedWord = await WordModel.updateWord(req.params.id, req.body);
      if (!updatedWord) return res.status(404).json({ success: false, message: 'Palabra no encontrada' });
      res.json({ success: true, data: updatedWord, message: 'Palabra actualizada exitosamente' });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(400).json({ success: false, message: 'Error al actualizar palabra' });
    }
  },

  async delete(req, res) {
    try {
      await WordModel.deleteWord(req.params.id);
      res.json({ success: true, message: 'Palabra eliminada exitosamente' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar palabra' });
    }
  }
};

export default WordController;

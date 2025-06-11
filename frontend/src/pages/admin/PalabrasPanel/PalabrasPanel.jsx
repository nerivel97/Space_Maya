import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import api from '../../../api/api';
import WordList from './WordList';
import WordForm from './WordForm';
import styles from '../../../styles/admin/PalabrasPanel.module.css';

const PalabrasPanel = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    length: ''
  });

  useEffect(() => {
    fetchWords();
  }, [filters]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/words', { params: filters });
      setWords(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las palabras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWord(null);
    setShowForm(true);
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta palabra?')) {
      try {
        await api.delete(`/words/${id}`);
        fetchWords();
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingWord) {
        await api.put(`/words/${editingWord.id}`, formData);
      } else {
        await api.post('/words', formData);
      }
      setShowForm(false);
      fetchWords();
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.palabrasPanel}>
        <header className={styles.header}>
          <h1>Administración de Palabras</h1>
          <button 
            onClick={handleCreate}
            className={styles.addButton}
          >
            + Nueva Palabra
          </button>
        </header>

        {showForm ? (
          <div className={styles.formContainer}>
            <WordForm
              word={editingWord}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <>
            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Buscar palabras..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <select
                value={filters.length}
                onChange={(e) => setFilters({...filters, length: e.target.value})}
              >
                <option value="">Todas las longitudes</option>
                {[3, 4, 5, 6].map(len => (
                  <option key={len} value={len}>{len} caracteres</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className={styles.loading}>Cargando palabras...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : (
              <WordList
                words={words}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default PalabrasPanel;
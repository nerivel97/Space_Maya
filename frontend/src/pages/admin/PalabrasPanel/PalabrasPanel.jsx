import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import api from '../../../api/api';
import WordList from './WordList';
import WordForm from './WordForm';
import styles from '../../../styles/admin/PalabrasPanel.module.css';

const PalabrasPanel = () => {
  const [allWords, setAllWords] = useState([]); // Todas las palabras
  const [currentPageWords, setCurrentPageWords] = useState([]); // Palabras de la página actual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Número de palabras por página
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    length: ''
  });

  useEffect(() => {
    fetchWords();
  }, [filters]); // Solo dependemos de los filtros ahora

  // Actualizar palabras visibles cuando cambia la paginación o las palabras
  useEffect(() => {
    updateVisibleWords();
  }, [pagination.page, pagination.limit, allWords]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/words', { 
        params: filters 
      });
      setAllWords(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.length,
        page: 1 // Resetear a primera página al obtener nuevos datos
      }));
      setError(null);
    } catch (err) {
      setError('Error al cargar las palabras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateVisibleWords = () => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setCurrentPageWords(allWords.slice(start, end));
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
                {[3, 4, 5, 6, 7, 8, 9, 10].map(len => (
                  <option key={len} value={len}>{len} caracteres</option>
                ))}
              </select>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1 // Resetear a página 1 al cambiar el límite
                }))}
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>

            {loading ? (
              <div className={styles.loading}>Cargando palabras...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : (
              <>
                <div className={styles.summary}>
                  Mostrando {currentPageWords.length} de {allWords.length} palabras
                </div>
                <WordList
                  words={currentPageWords}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                <div className={styles.pagination}>
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <button
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default PalabrasPanel;
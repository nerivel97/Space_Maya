import React, { useState, useEffect } from 'react';
import styles from '../../../styles/admin/WordForm.module.css';

const WordForm = ({ word, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    palabra_es: '',
    palabra_maya: ''
  });

  useEffect(() => {
    if (word) {
      setFormData({
        palabra_es: word.palabra_es,
        palabra_maya: word.palabra_maya
      });
    }
  }, [word]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wordForm}>
      <h2>{word ? 'Editar Palabra' : 'Nueva Palabra'}</h2>
      
      <div className={styles.formGroup}>
        <label>Palabra en Español:</label>
        <input
          type="text"
          name="palabra_es"
          value={formData.palabra_es}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>Palabra en Maya:</label>
        <input
          type="text"
          name="palabra_maya"
          value={formData.palabra_maya}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {word ? 'Actualizar' : 'Crear'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default WordForm;
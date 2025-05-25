import React, { useState, useEffect, useRef } from 'react';
import styles from '../../../styles/admin/TagSelector.module.css';

const TagSelector = ({ selectedTags = [], onChange, availableTags = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTags, setFilteredTags] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Filtrar tags disponibles que no estén ya seleccionadas
    const filtered = availableTags.filter(
      tag => !selectedTags.includes(tag.id) && 
        tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredTags(filtered);
  }, [inputValue, selectedTags, availableTags]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() && filteredTags.length === 0) {
      e.preventDefault();
      // Aquí podrías agregar lógica para crear una nueva etiqueta
    }
  };

  const addTag = (tag) => {
    const newTags = [...selectedTags, tag.id];
    onChange(newTags);
    setInputValue('');
    setShowDropdown(false);
  };

  const removeTag = (tagId) => {
    const newTags = selectedTags.filter(id => id !== tagId);
    onChange(newTags);
  };

  return (
    <div className={styles.tagSelector} ref={wrapperRef}>
      {selectedTags.map(tagId => {
        const tag = availableTags.find(t => t.id === tagId);
        return (
          <div key={tagId} className={styles.tagItem}>
            {tag?.name || 'Etiqueta no encontrada'}
            <button
              type="button"
              className={styles.tagRemoveButton}
              onClick={() => removeTag(tagId)}
            >
              ×
            </button>
          </div>
        );
      })}
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(true)}
        className={styles.tagInput}
        placeholder="Añadir etiquetas..."
      />
      
      {showDropdown && filteredTags.length > 0 && (
        <div className={styles.tagDropdown}>
          {filteredTags.map(tag => (
            <div
              key={tag.id}
              className={styles.tagDropdownItem}
              onClick={() => addTag(tag)}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
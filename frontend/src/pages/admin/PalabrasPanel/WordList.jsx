import React from 'react';
import styles from '../../../styles/admin/WordList.module.css';

const WordList = ({ words, onEdit, onDelete }) => {
  return (
    <div className={styles.wordList}>
      <table>
        <thead>
          <tr>
            <th>Español</th>
            <th>Maya</th>
            <th>Longitud</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <tr key={word.id}>
              <td>{word.palabra_es}</td>
              <td>{word.palabra_maya}</td>
              <td>{word.longitud_es}</td>
              <td>
                <button 
                  onClick={() => onEdit(word)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button 
                  onClick={() => onDelete(word.id)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WordList;
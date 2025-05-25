import React, { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/admin/RichTextEditor.module.css';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    const html = editorRef.current.innerHTML;
    onChange(html);

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setIsActive(range.toString().length > 0);

      if (range.toString().length > 0) {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
      }
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolButton} ${isBold ? styles.active : ''}`}
          onClick={() => formatText('bold')}
          title="Negrita"
          disabled={!isActive}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${isItalic ? styles.active : ''}`}
          onClick={() => formatText('italic')}
          title="Cursiva"
          disabled={!isActive}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => formatText('insertUnorderedList')}
          title="Lista"
        >
          <span>•</span>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => formatText('insertOrderedList')}
          title="Lista numerada"
        >
          <span>1.</span>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => formatText('createLink', prompt('Ingrese la URL:'))}
          title="Enlace"
        >
          <span>🔗</span>
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={handleInput}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;

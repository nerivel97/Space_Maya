import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Importa tu archivo api.js directamente
import styles from '../styles/Wordle.module.css';

const Wordle = () => {
  const [guesses, setGuesses] = useState(Array(6).fill({ word: '', translation: '' }));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctWord, setCorrectWord] = useState('');
  const [wordLength, setWordLength] = useState(5);
  const [letterStates, setLetterStates] = useState({});
  const [message, setMessage] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [guessTranslation, setGuessTranslation] = useState('');
  const [wordsList, setWordsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWordsFromDB();
  }, []);

  // Función para obtener palabras de la base de datos
  const fetchWordsFromDB = async () => {
    try {
      setLoading(true);
      const response = await api.get('/words'); // Usa tu instancia de api directamente
      setWordsList(response.data);
      startNewGame(response.data);
    } catch (error) {
      console.error('Error fetching words:', error);
      setMessage('Error al cargar palabras');
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = (words = wordsList) => {
    if (words.length === 0) return;
    
    const randomEntry = words[Math.floor(Math.random() * words.length)];
    setCorrectWord(randomEntry.palabra_es.toUpperCase());
    setCurrentTranslation(randomEntry.palabra_maya.toUpperCase());
    setWordLength(randomEntry.palabra_es.length);
    setGuesses(Array(6).fill({ word: '', translation: '' }));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setLetterStates({});
    setMessage('');
    setGuessTranslation('');
  };

  const updateGuessTranslation = (guess) => {
    const found = wordsList.find(word => 
      word.palabra_es.toUpperCase() === guess
    );
    setGuessTranslation(found ? found.palabra_maya.toUpperCase() : '');
  };

  const handleKeyDown = (e) => {
    if (gameOver || loading) return;

    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
      if (currentGuess.length === wordLength) {
        const match = wordsList.find(word => 
          word.palabra_es.toUpperCase() === currentGuess
        );

        if (!match) {
          setMessage('Palabra no válida');
          setGuessTranslation('');
          return;
        }

        const newGuesses = [...guesses];
        newGuesses[currentRow] = {
          word: currentGuess,
          translation: match.palabra_maya.toUpperCase()
        };
        setGuesses(newGuesses);
        setGuessTranslation('');

        if (currentGuess === correctWord) {
          setMessage('¡Ganaste!');
          setGameOver(true);
          return;
        }

        const newLetterStates = { ...letterStates };
        const correctLetters = correctWord.split('');

        currentGuess.split('').forEach((letter, i) => {
          if (!newLetterStates[letter]) {
            newLetterStates[letter] = 'absent';
          }

          if (correctLetters[i] === letter) {
            newLetterStates[letter] = 'correct';
          } else if (correctLetters.includes(letter)) {
            newLetterStates[letter] = 'present';
          }
        });

        setLetterStates(newLetterStates);

        if (currentRow < 5) {
          setCurrentRow(currentRow + 1);
          setCurrentGuess('');
          setMessage('');
        } else {
          setMessage(`Perdiste. La palabra era: ${correctWord}`);
          setGameOver(true);
        }
      } else {
        setMessage(`La palabra debe tener ${wordLength} letras`);
      }
    } else if (key === 'BACKSPACE') {
      const updated = currentGuess.slice(0, -1);
      setCurrentGuess(updated);
      updateGuessTranslation(updated);
      setMessage('');
    } else if (/^[A-ZÁÉÍÓÚÜÑ]$/i.test(key) && currentGuess.length < wordLength) {
      const updated = currentGuess + key;
      setCurrentGuess(updated);
      updateGuessTranslation(updated);
      setMessage('');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentGuess, gameOver, loading]);

  const getLetterState = (row, col) => {
    const guess = guesses[row].word;
    if (!guess || guess.length <= col) return '';

    const letter = guess[col];
    if (correctWord[col] === letter) return 'correct';
    if (correctWord.includes(letter)) return 'present';
    return 'absent';
  };

  const handleVirtualKeyPress = (key) => {
    handleKeyDown({ key });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Wordle Maya</h1>
        <div className={styles.message}>Cargando palabras...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Wordle Maya</h1>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.board}>
        {guesses.map((guessObj, row) => (
          <div key={row} className={styles.rowContainer}>
            <div className={styles.row} style={{ '--word-length': wordLength }}>
              {[...Array(wordLength).keys()].map((col) => {
                const isCurrentRow = row === currentRow;
                const letter = isCurrentRow && col < currentGuess.length
                  ? currentGuess[col]
                  : guessObj.word[col] || '';

                const state = row < currentRow || (row === currentRow && gameOver && currentGuess === correctWord)
                  ? getLetterState(row, col)
                  : '';

                return (
                  <div
                    key={col}
                    className={`${styles.cell} ${styles[state]}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>

            <div className={styles.translationCell}>
              {row === currentRow && !gameOver && currentGuess ? (
                <span>{guessTranslation || 'Sin traducción'}</span>
              ) : guessObj.translation ? (
                <span>{guessObj.translation}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.keyboard}>
        <div className={styles.keyboardRow}>
          {'QWERTYUIOP'.split('').map(letter => (
            <button
              key={letter}
              className={`${styles.key} ${styles[letterStates[letter] || '']}`}
              onClick={() => handleVirtualKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.keyboardRow}>
          {'ASDFGHJKL'.split('').map(letter => (
            <button
              key={letter}
              className={`${styles.key} ${styles[letterStates[letter] || '']}`}
              onClick={() => handleVirtualKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.keyboardRow}>
          <button
            className={`${styles.key} ${styles.bigKey}`}
            onClick={() => handleVirtualKeyPress('Backspace')}
          >
            ⌫
          </button>
          {'ZXCVBNM'.split('').map(letter => (
            <button
              key={letter}
              className={`${styles.key} ${styles[letterStates[letter] || '']}`}
              onClick={() => handleVirtualKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
          <button
            className={`${styles.key} ${styles.bigKey}`}
            onClick={() => handleVirtualKeyPress('Enter')}
          >
            ENTER
          </button>
        </div>
      </div>

      <button className={styles.newGameButton} onClick={() => startNewGame(wordsList)}>
        Nuevo Juego
      </button>
    </div>
  );
};

export default Wordle;
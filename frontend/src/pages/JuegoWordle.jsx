import React, { useState, useEffect } from 'react';
import { WORDS } from '../../public/words';
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

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomEntry = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCorrectWord(randomEntry.es.toUpperCase());
    setCurrentTranslation(randomEntry.maya.toUpperCase());
    setWordLength(randomEntry.es.length);
    setGuesses(Array(6).fill({ word: '', translation: '' }));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setLetterStates({});
    setMessage('');
    setGuessTranslation('');
  };

  const updateGuessTranslation = (guess) => {
    const found = WORDS.find(word => word.es.toUpperCase() === guess);
    setGuessTranslation(found ? found.maya.toUpperCase() : '');
  };

  const handleKeyDown = (e) => {
    if (gameOver) return;

    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
      if (currentGuess.length === wordLength) {
        const match = WORDS.find(word => word.es.toUpperCase() === currentGuess);

        if (!match) {
          setMessage('Palabra no válida');
          setGuessTranslation('');
          return;
        }

        const newGuesses = [...guesses];
        newGuesses[currentRow] = {
          word: currentGuess,
          translation: match.maya.toUpperCase()
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
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
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
  }, [currentGuess, gameOver]);

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

      <button className={styles.newGameButton} onClick={startNewGame}>
        Nuevo Juego
      </button>
    </div>
  );
};

export default Wordle;

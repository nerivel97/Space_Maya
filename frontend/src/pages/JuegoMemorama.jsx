import React, { useState, useEffect } from 'react';
import { FaBrain, FaQuestion, FaFire, FaStar, FaWater, FaSun, FaDog, FaCat, FaPaw, FaKiwiBird } from 'react-icons/fa';
import styles from '../styles/JuegoMemorama.module.css';

const JuegoMemorama = () => {
  // Vocabulario maya-español con iconos
  const palabras = [
    { maya: "Ka'", espanol: "Fuego", icono: <FaFire size={40} /> },
    { maya: "Chooj", espanol: "Estrella", icono: <FaStar size={40} /> },
    { maya: "Ja'", espanol: "Agua", icono: <FaWater size={40} /> },
    { maya: "K'iin", espanol: "Sol", icono: <FaSun size={40} /> },
    { maya: "Peek'", espanol: "Perro", icono: <FaDog size={40} /> },
    { maya: "Miis", espanol: "Gato", icono: <FaCat size={40} /> },
    { maya: "T'u'ul", espanol: "Conejo", icono: <FaPaw size={40} /> },
    { maya: "Koh", espanol: "Mono", icono: <FaKiwiBird size={40} /> }
  ];

  // Estado del juego
  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [cartasEncontradas, setCartasEncontradas] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [juegoCompletado, setJuegoCompletado] = useState(false);

  // Inicializar juego
  const iniciarJuego = () => {
    // Duplicar y mezclar las cartas
    const cartasMezcladas = [...palabras, ...palabras]
      .map((carta, index) => ({ ...carta, id: index }))
      .sort(() => Math.random() - 0.5);

    setCartas(cartasMezcladas);
    setCartasVolteadas([]);
    setCartasEncontradas([]);
    setIntentos(0);
    setJuegoCompletado(false);
  };

  // Voltear carta
  const voltearCarta = (id) => {
    // No hacer nada si ya está volteada o encontrada
    if (cartasVolteadas.includes(id) || cartasEncontradas.includes(id) || cartasVolteadas.length >= 2) {
      return;
    }

    const nuevasVolteadas = [...cartasVolteadas, id];
    setCartasVolteadas(nuevasVolteadas);

    // Verificar si hay pareja
    if (nuevasVolteadas.length === 2) {
      setIntentos(intentos + 1);
      const [primeraId, segundaId] = nuevasVolteadas;
      const primeraCarta = cartas.find(c => c.id === primeraId);
      const segundaCarta = cartas.find(c => c.id === segundaId);

      if (primeraCarta.maya === segundaCarta.maya) {
        setCartasEncontradas([...cartasEncontradas, primeraId, segundaId]);
        setCartasVolteadas([]);
      } else {
        setTimeout(() => setCartasVolteadas([]), 1000);
      }
    }
  };

  // Efecto para verificar si el juego está completo
  useEffect(() => {
    if (cartas.length > 0 && cartasEncontradas.length === cartas.length) {
      setJuegoCompletado(true);
    }
  }, [cartasEncontradas, cartas]);

  // Iniciar juego al cargar
  useEffect(() => {
    iniciarJuego();
  }, []);

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Memorama Maya <FaBrain /></h1>
      
      <div className={styles.controles}>
        <p>Intentos: <span className={styles.contador}>{intentos}</span></p>
        <button onClick={iniciarJuego} className={styles.botonReiniciar}>
          Reiniciar Juego
        </button>
      </div>

      {juegoCompletado ? (
        <div className={styles.mensajeGanador}>
          <h2>¡Felicidades! 🎉</h2>
          <p>Completaste el juego en {intentos} intentos.</p>
          <button onClick={iniciarJuego} className={styles.botonReiniciar}>
            Jugar de nuevo
          </button>
        </div>
      ) : (
        <div className={styles.tablero}>
          {cartas.map((carta) => {
            const estaVolteada = cartasVolteadas.includes(carta.id);
            const estaEncontrada = cartasEncontradas.includes(carta.id);
            const mostrarContenido = estaVolteada || estaEncontrada;

            return (
              <div
                key={carta.id}
                className={`${styles.carta} ${estaEncontrada ? styles.encontrada : ''}`}
                onClick={() => voltearCarta(carta.id)}
              >
                <div className={`${styles.contenidoCarta} ${mostrarContenido ? styles.volteada : ''}`}>
                  <div className={styles.frente}>
                    <FaQuestion size={50} />
                  </div>
                  <div className={styles.atras}>
                    {carta.icono}
                    <h3>{carta.maya}</h3>
                    <p>{carta.espanol}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JuegoMemorama;
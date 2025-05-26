import { Link } from 'react-router-dom';
import { FaBookOpen, FaMapMarkedAlt, FaGamepad, FaArrowRight } from 'react-icons/fa';
import { FaBookQuran, FaBookTanakh } from "react-icons/fa6";
import { MdOutlineForum } from "react-icons/md";
import styles from '../styles/Home.module.css';


const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className={`${styles.hero} ${styles.heroMain}`}>
        <div className={styles.heroContent}>
          <h1>Descubre la riqueza de la cultura Maya</h1>
          <p>Aprende el idioma Maya a través de nuestras herramientas interactivas y sumérgete en una cultura milenaria.</p>
          <Link to="/cursos" className={styles.btnHero}>COMENZAR AHORA</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestras Herramientas</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <FaBookOpen />
              </div>
              <h3 className={styles.cardTitle}>Vocabulario</h3>
              <p className={styles.cardText}>Amplía tu conocimiento con nuestro extenso diccionario visual y auditivo Maya-Español.</p>
              <Link to="/herramientas/vocabulario" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <FaMapMarkedAlt />
              </div>
              <h3 className={styles.cardTitle}>Mapa Dinámico</h3>
              <p className={styles.cardText}>Descubre las regiones mayas y sus variantes lingüísticas a través de nuestro mapa interactivo.</p>
              <Link to="/herramientas/mapa" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <FaGamepad />
              </div>
              <h3 className={styles.cardTitle}>Juego Educativo</h3>
              <p className={styles.cardText}>Aprende divirtiéndote con nuestro juego interactivo que refuerza tu aprendizaje.</p>
              <Link to="/herramientas/memorama" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Aprende con ...</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <FaBookTanakh />
              </div>
              <h3 className={styles.cardTitle}>.....</h3>
              <p className={styles.cardText}>Amplía tu conocimiento y conoce los mitos mas conocidos de la region.</p>
              <Link to="/" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <FaBookQuran />
              </div>
              <h3 className={styles.cardTitle}>Mitos y Leyendas</h3>
              <p className={styles.cardText}>Descubre las leyendas mas conocidas de la region maya.</p>
              <Link to="/aprende/mitos-leyendas" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>
                <MdOutlineForum />
              </div>
              <h3 className={styles.cardTitle}>Foro</h3>
              <p className={styles.cardText}>Aprende mientras conoces personas como tu, unete a nuestro foro de discusion!</p>
              <Link to="/aprende/foro" className={styles.cardLink}>Explorar <FaArrowRight className={styles.arrowIcon} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className={styles.blogSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Últimos Artículos</h2>
          <div className={styles.blogGrid}>
            <article className={styles.blogCard}>
              <img src="img/logov1.png" alt="Arte Maya" className={styles.cardImage} />
              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>Cultura</span>
                <h3 className={styles.cardTitle}>El significado de los glifos mayas y su interpretación moderna</h3>
                <p className={styles.cardAuthor}>Por <span className={styles.name}>Carlos Tun</span> · 3 días atrás</p>
              </div>
            </article>
            
            <article className={styles.blogCard}>
              <img src="img/logov1.png" alt="Lengua Maya" className={styles.cardImage} />
              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>Lingüística</span>
                <h3 className={styles.cardTitle}>Variantes dialectales del maya yucateco en la península</h3>
                <p className={styles.cardAuthor}>Por <span className={styles.name}>María Canul</span> · 1 semana atrás</p>
              </div>
            </article>
            
            <article className={styles.blogCard}>
              <img src="img/logov1.png" alt="Historia Maya" className={styles.cardImage} />
              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>Historia</span>
                <h3 className={styles.cardTitle}>El calendario maya: más que una herramienta para medir el tiempo</h3>
                <p className={styles.cardAuthor}>Por <span className={styles.name}>Javier Chan</span> · 2 semanas atrás</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <h3 className={styles.newsletterTitle}>Mantente actualizado</h3>
            <p className={styles.newsletterText}>Recibe actualizaciones, nuevos recursos y artículos sobre la cultura maya directamente en tu correo.</p>
            <form className={styles.newsletterForm}>
              <input type="email" className={styles.newsletterInput} placeholder="Tu correo electrónico" required />
              <button type="submit" className={styles.newsletterBtn}>Enviar</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

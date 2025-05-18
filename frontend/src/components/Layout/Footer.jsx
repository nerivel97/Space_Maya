import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <img src="/img/logov2.png" alt="Aprende Maya" className={styles.footerLogo} />
            <p className={styles.footerAbout}>
              Plataforma dedicada a la preservación y enseñanza de la lengua y cultura maya a través de herramientas interactivas y recursos educativos.
            </p>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialIcon}><FaFacebookF /></a>
              <a href="#" className={styles.socialIcon}><FaTwitter /></a>
              <a href="#" className={styles.socialIcon}><FaInstagram /></a>
              <a href="#" className={styles.socialIcon}><FaYoutube /></a>
            </div>
          </div>
          
          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Enlaces rápidos</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/aprende">Aprende</Link></li>
              <li><Link to="/herramientas">Herramientas</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Contacto</h4>
            <ul className={styles.footerLinks}>
              <li><FaEnvelope className={styles.icon} /> info@aprendemaya.com</li>
              <li><FaPhone className={styles.icon} /> +52 999 123 4567</li>
              <li><FaMapMarkerAlt className={styles.icon} /> Mérida, Yucatán, México</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} Aprende Maya. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
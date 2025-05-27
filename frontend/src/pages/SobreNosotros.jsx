import React from 'react';
import styles from '../styles/SobreNosotros.module.css';
import { FaUniversity, FaUsers, FaLightbulb, FaChartLine, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { MdComputer, MdSchool } from 'react-icons/md';

const SobreNosotros = () => {
  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sobre Nosotros</h1>
          <p className={styles.heroSubtitle}>Instituto Tecnológico de Cancún - Formando líderes del mañana</p>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.missionContent}>
            <h2 className={styles.sectionTitle}>Nuestra Misión</h2>
            <p className={styles.sectionText}>
              Formar profesionales competentes, innovadores y comprometidos con el desarrollo sostenible de la región,
              mediante programas educativos de calidad, vinculación efectiva con el sector productivo y la promoción de
              valores éticos y humanos.
            </p>
          </div>
          <div className={styles.missionImage}>
            <FaUniversity className={styles.missionIcon} />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconContainer}>
              <GiTeacher className={styles.valueIcon} />
            </div>
            <h3 className={styles.valueTitle}>Excelencia Académica</h3>
            <p className={styles.valueDescription}>
              Compromiso con la calidad educativa y la actualización constante de nuestros programas.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIconContainer}>
              <FaUsers className={styles.valueIcon} />
            </div>
            <h3 className={styles.valueTitle}>Responsabilidad Social</h3>
            <p className={styles.valueDescription}>
              Contribución activa al desarrollo sostenible de nuestra comunidad y entorno.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIconContainer}>
              <FaLightbulb className={styles.valueIcon} />
            </div>
            <h3 className={styles.valueTitle}>Innovación</h3>
            <p className={styles.valueDescription}>
              Fomento de la creatividad y el espíritu emprendedor en nuestros estudiantes.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIconContainer}>
              <FaChartLine className={styles.valueIcon} />
            </div>
            <h3 className={styles.valueTitle}>Integridad</h3>
            <p className={styles.valueDescription}>
              Actuamos con honestidad, transparencia y respeto en todas nuestras acciones.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className={styles.historySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.historyImage}>
            <MdSchool className={styles.historyIcon} />
          </div>
          <div className={styles.historyContent}>
            <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
            <p className={styles.sectionText}>
              Fundado en 1985, el Instituto Tecnológico de Cancún ha sido pionero en la formación de profesionales
              técnicos en la región. Desde nuestros humildes comienzos con apenas 3 carreras, hoy ofrecemos más de 15
              programas educativos en áreas de ingeniería, tecnología y administración.
            </p>
            <p className={styles.sectionText}>
              Hemos graduado a más de 10,000 profesionales que hoy contribuyen al desarrollo de Quintana Roo y México.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className={styles.programsSection}>
        <h2 className={styles.sectionTitle}>Nuestros Programas Académicos</h2>
        <div className={styles.programsGrid}>
          <div className={styles.programCard}>
            <MdComputer className={styles.programIcon} />
            <h3 className={styles.programTitle}>Ingeniería en Sistemas Computacionales</h3>
            <p className={styles.programDescription}>
              Formamos expertos en desarrollo de software, redes y tecnologías de la información.
            </p>
          </div>
          <div className={styles.programCard}>
            <MdComputer className={styles.programIcon} />
            <h3 className={styles.programTitle}>Ingeniería en Tecnologías de la Información</h3>
            <p className={styles.programDescription}>
              Especialistas en gestión y desarrollo de soluciones tecnológicas innovadoras.
            </p>
          </div>
          <div className={styles.programCard}>
            <MdComputer className={styles.programIcon} />
            <h3 className={styles.programTitle}>Ingeniería Industrial</h3>
            <p className={styles.programDescription}>
              Profesionales capaces de optimizar procesos productivos y de servicios.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <h2 className={styles.sectionTitle}>Contáctanos</h2>
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <p>Av. Kabah km 3, Supermanzana 3, Cancún, Q.R.</p>
            </div>
            <div className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <p>+52 (998) 881 1900</p>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <p>contacto@itcancun.edu.mx</p>
            </div>
          </div>
          <div className={styles.socialMedia}>
            <h3 className={styles.socialTitle}>Síguenos</h3>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialLink}><FaLinkedin /></a>
              <a href="#" className={styles.socialLink}><FaTwitter /></a>
              <a href="#" className={styles.socialLink}><FaInstagram /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNosotros;
import { Link } from 'react-router-dom';
import styles from './MythCard.module.css';

const Milecard = ({ myth }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        {myth.featured_image ? (
          <img src={myth.featured_image} alt={myth.title} />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{myth.title.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.categoryTag}>{myth.category}</div>
        <h3 className={styles.cardTitle}>
          <Link to={`/mitos/${myth.id}`}>{myth.title}</Link>
        </h3>
        
        <div className={styles.originInfo}>
          <span>{myth.origin_region}</span>
          <span> • </span>
          <span>{myth.origin_culture}</span>
        </div>
        
        <p className={styles.cardExcerpt}>
          {myth.content.substring(0, 150)}...
        </p>
        
        <div className={styles.cardFooter}>
          <Link to={`/mitos/${myth.id}`} className={styles.readMore}>
            Leer más
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Milecard;
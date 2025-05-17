import styles from './card.module.css';


const Card = ({ image, title, description, onClick }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} />
      <div className={styles.card_body}>
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onClick}>Ver más</button>
      </div>
    </div>
  );
};

export default Card;

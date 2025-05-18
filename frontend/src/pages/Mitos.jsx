import styles from '../styles/Mitos.module.css';
import Card from '../components/MYLComponent/card'

const Mitos = () => {
   return (
        <div>
      {/* Hero Section */}
      <section className={`${styles.hero} ${styles.heroMain}`}>
        <div className={styles.heroContent}>
        </div>
      </section>

      <div className={styles.container}>
        <Card
          image=""
          title="La llorona"
          description="Esta es una tarjeta súper estilizada para mostrar algo genial."
          onClick={() => alert('¡Haz clic en Ver más!')}
        />

        <Card
          image=""
          title="El Chupa Cabras"
          description="Esta es una tarjeta súper estilizada para mostrar algo genial."
          onClick={() => alert('¡Haz clic en Ver más!')}
        />

        <Card
          image=""
          title=""
          description="Esta es una tarjeta súper estilizada para mostrar algo genial."
          onClick={() => alert('¡Haz clic en Ver más!')}
        />

        <Card
          image=""
          title=""
          description="Esta es una tarjeta súper estilizada para mostrar algo genial."
          onClick={() => alert('¡Haz clic en Ver más!')}
        />
      </div>
      <div className={styles.container}>
        <Card
        />

        <Card
        />
      </div>

      <div className={styles.container}>
        <Card
        />
      </div>
    </div>
  );
};

export default Mitos;

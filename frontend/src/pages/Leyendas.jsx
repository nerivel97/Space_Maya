import styles from './Leyendas.module.css';
import Card from '../components/MYLComponent/card'

const Leyendas = () => {
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
          title=""
          description="Aqui deberian ir las leyendas jeje"
          onClick={() => alert('¡No hace nada pero esta chido apoco no? xD!')}
        />

      </div>
    </div>

    
  );
};

export default Leyendas;
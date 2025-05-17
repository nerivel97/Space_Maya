import styles from './Mitos_Leyendas.module.css';
import Card from '../components/MYLComponent/card'

const Mitos_Leyendas = () => {
   return (
    <div>
      <div className={styles.banner}>
        <h1>Bienvenido a Mi Página</h1>
      </div>

      <div className={styles.container}>
        <Card
          image="https://images.unsplash.com/photo-1602524209262-6f3f90ba0ba9"
          title="Mi Card Bonita"
          description="Esta es una tarjeta súper estilizada para mostrar algo genial."
          onClick={() => alert('¡Haz clic en Ver más!')}
        />
      </div>
      <div className={styles.container}>
        <Card
        />
      </div>
    </div>
  );
};

export default Mitos_Leyendas;

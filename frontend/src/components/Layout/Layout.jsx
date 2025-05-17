import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet /> {/* Aquí se inyectarán las rutas hijas */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
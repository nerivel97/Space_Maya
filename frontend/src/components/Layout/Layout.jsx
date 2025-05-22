import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingChat from '../chatComponent/FloatingChat';
import useAuth from '../../context/useAuth'; // <- asegúrate de que la ruta sea correcta

const Layout = () => {
  const { currentUser } = useAuth(); // <- esto usa tu hook

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
        {currentUser && <FloatingChat />} {/* solo si hay usuario */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

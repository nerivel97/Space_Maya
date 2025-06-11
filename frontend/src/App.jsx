import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AuthProvider from './context/AuthProvider';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Mapa';
import MythPanel from './pages/admin/MythLegend/MythPanel';
import Miandle from './pages/Miandle';
import Foro from './pages/Foro';
import Perfil from './pages/Perfil';
import VocabularioPanel from './pages/admin/VocabPanel/VocabularioPanel';
import Vocabulario from './pages/Vocabulario';
import JuegoMemorama from './pages/JuegoMemorama';
import Wordle from './pages/juegoWordle';
import PalabrasPanel from './pages/admin/PalabrasPanel/PalabrasPanel';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMapPanel from './pages/admin/MapPanel/MapPanel';
import SobreNosotros from './pages/SobreNosotros';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="sobre-nosotros" element={<SobreNosotros />} />


            <Route path="/perfil" element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            } />

            <Route path="/herramientas/mapa" element={
              <PrivateRoute>
                <Map />
              </PrivateRoute>
            } />

            <Route path="/herramientas/vocabulario" element={
              <PrivateRoute>
                <Vocabulario />
              </PrivateRoute>
            } />

            <Route path="/herramientas/memorama" element={
              <PrivateRoute>
                <JuegoMemorama />
              </PrivateRoute>
            } />

            <Route path="/herramientas/wordle" element={
              <PrivateRoute>
                <Wordle />
              </PrivateRoute>
            } />

            <Route path="/aprende/foro" element={
              <PrivateRoute>
                <Foro />
              </PrivateRoute>
            } />

            <Route path="/aprende/mitos-leyendas" element={
              <PrivateRoute>
                <Miandle />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/admin/map-panel" element={
              <AdminRoute>
                <AdminMapPanel />
              </AdminRoute>
            } />

            <Route path="/admin/mitos-leyendas-panel" element={
              <AdminRoute>
                <MythPanel />
              </AdminRoute>
            } />

            <Route path="/admin/vocabulario-panel" element={
              <PrivateRoute>
                <VocabularioPanel />
              </PrivateRoute>
            } />

            <Route path="/admin/palabras-panel" element={
              <PrivateRoute>
                <PalabrasPanel />
              </PrivateRoute>
            } />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
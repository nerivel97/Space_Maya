import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AuthProvider from './context/AuthProvider';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Mapa';
import MythsPanel from './pages/admin/MythLegend/MythsPanel';

import Foro from './pages/Foro';
import Perfil from './pages/Perfil';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMapPanel from './pages/admin/MapPanel/MapPanel';
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
            
            

            <Route path="/aprende/foro" element={
              <PrivateRoute>
                <Foro />
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
                <MythsPanel />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
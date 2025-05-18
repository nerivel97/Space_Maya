import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import  AuthProvider  from './context/AuthProvider';
import { PrivateRoute } from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Mapa';
import Mitos from './pages/Mitos';
import Leyendas from './pages/Leyendas';
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
            
            {/* Rutas protegidas */}
            <Route path="/herramientas/mapa" element={
              <PrivateRoute>
                <Map />
              </PrivateRoute>
            } />
            
            <Route path="/mitos" element={
              <PrivateRoute>
                <Mitos />
              </PrivateRoute>
            } />
            
            <Route path="/leyendas" element={
              <PrivateRoute>
                <Leyendas />
              </PrivateRoute>
            } />

            {/* Ejemplo de ruta solo para admin */}
            <Route path="/admin" element={
              <PrivateRoute adminOnly={true}>
                <div>Panel de administración</div>
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Visit from './components/Visit'; 
import Delivery from './components/Delivery'; 
import Vehicles from './components/Vehicles'; 
import LanguageSelector from './components/LanguageSelector';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/AuthContext';
import './App.css'; // Importa tu archivo de estilos CSS

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Container fluid className="main-container">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/visit" 
                element={
                  <PrivateRoute>
                    <Visit />
                  </PrivateRoute>
                }
              />
              <Route
                path="/delivery" 
                element={
                  <PrivateRoute>
                    <Delivery />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vehicles" 
                element={
                  <PrivateRoute>
                    <Vehicles />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Container>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

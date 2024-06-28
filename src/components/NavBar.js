import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container, Button, Alert, NavItem } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Importa el contexto de autenticación
import { LinkContainer } from 'react-router-bootstrap';  // Asegúrate de importar LinkContainer
import LanguageSelector from './LanguageSelector'; // Importa el LanguageSelector
import './styles.css'; // Importa el archivo CSS

function NavBar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth(); // Usa el contexto de autenticación
  const [showAlert, setShowAlert] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    setShowAlert(true);
    setTimeout(() => {
      setLoggedOut(true);
    }, 1000); // Redirigir después de 1 segundo
  };

  if (loggedOut) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar expand="lg" className="navbar-custom mx-3 my-3 rounded">
        <Container fluid>
          <LinkContainer to="/home">
            <Navbar.Brand style={{ fontSize: '1.5rem', cursor: 'pointer' }}>{t('welcome')}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="w-100 justify-content-evenly" style={{ fontSize: '1.2rem' }}>
              <LinkContainer to="/home">
                <Nav.Link className="navbar-link">{t('home')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/delivery">
                <Nav.Link className="navbar-link">{t('delivery')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/visit">
                <Nav.Link className="navbar-link">{t('visitors')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/vehicles">
                <Nav.Link className="navbar-link">{t('vehicles')}</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav className="ml-auto align-items-center">
              <Nav.Item className="d-flex align-items-center">
                <LanguageSelector />
              </Nav.Item>
              {isAuthenticated && (
                <Button variant="outline-light" onClick={handleLogout}>{t('logout')}</Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAlert && (
        <Alert className="mt-3" variant="success" onClose={() => setShowAlert(false)} dismissible>
          {t('logoutSuccessMessage')}
        </Alert>
      )}
    </>
  );
}

export default NavBar;

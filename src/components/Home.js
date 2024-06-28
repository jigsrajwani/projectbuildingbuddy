import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Carousel, Button } from 'react-bootstrap';
import NavBar from './NavBar';
import Footer from './Footer';
import building1 from '../img/building1.jpg';
import building2 from '../img/building2.jpeg';
import building3 from '../img/building3.jpg';

function Home() {
  const { t } = useTranslation();

  const carouselItemStyle = {
    maxHeight: '400px',
    objectFit: 'cover',
  };

  const captionStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px',
    borderRadius: '5px',
  };

  const buttonStyle = {
    backgroundColor: 'green',
    color: 'white',
    padding: '15px 30px',
    fontSize: '1.5em',
    border: 'none',
    borderRadius: '5px',
    margin: '20px auto',
    display: 'block',
    textAlign: 'center',
  };

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={pageStyle}>
      <NavBar />
      <Container fluid style={{ flex: '1', padding: '0' }}>
        <Carousel>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={building1}
              alt="First slide"
              style={carouselItemStyle}
            />
            <Carousel.Caption style={captionStyle}>
              <h3>{t('firstSlideLabel')}</h3>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={building2}
              alt="Second slide"
              style={carouselItemStyle}
            />
            <Carousel.Caption style={captionStyle}>
              <h3>{t('secondSlideLabel')}</h3>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={building3}
              alt="Third slide"
              style={carouselItemStyle}
            />
            <Carousel.Caption style={captionStyle}>
              <h3>{t('thirdSlideLabel')}</h3>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
        <Button
          style={buttonStyle}
          href="https://wa.link/qaz3jv"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('contactUsNow')}
        </Button>
        {/* Añade más contenido aquí */}
      </Container>
      <Footer />
    </div>
  );
}

export default Home;

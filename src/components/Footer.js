import React from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer mt-auto py-3">
      <div className="container text-center">
        <span className="text-muted">© {new Date().getFullYear()} BuildingBuddy. {t('rightsReserved')}.</span>
      </div>
    </footer>
  );
}

export default Footer;

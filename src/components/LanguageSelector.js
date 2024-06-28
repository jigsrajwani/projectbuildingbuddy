import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

function LanguageSelector() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    const currentLanguage = localStorage.getItem('i18nextLng');
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
      i18n.changeLanguage(currentLanguage);
    }
  }, []);

  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  };

  return (
    <div className='mx-4'>
      <select 
        value={selectedLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="en"> English </option>
        <option value="es"> Español </option>
      </select>
    </div>
  );
}

export default LanguageSelector;

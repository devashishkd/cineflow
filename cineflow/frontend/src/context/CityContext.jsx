import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  
  useEffect(() => {
    // Try to load saved city from localStorage
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      setSelectedCity(saved);
    } else {
      // If no city is selected on initial load, force the modal open
      setIsCityModalOpen(true);
    }

    api.get('/movies/cities')
      .then(res => setCities(res.data.data || []))
      .catch(err => console.error('Error fetching cities:', err));
  }, []);

  const changeCity = (city) => {
    setSelectedCity(city);
    if (city) {
      localStorage.setItem('selectedCity', city);
      setIsCityModalOpen(false); // Close modal when city is selected
    } else {
      localStorage.removeItem('selectedCity');
    }
  };

  return (
    <CityContext.Provider value={{ 
      cities, 
      selectedCity, 
      changeCity,
      isCityModalOpen,
      setIsCityModalOpen
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);

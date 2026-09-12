import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CityContext = createContext();

const DEFAULT_POPULAR_CITIES = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState(DEFAULT_POPULAR_CITIES);
  const [selectedCity, setSelectedCity] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const fetchCities = async () => {
    try {
      const res = await api.get('/theatres/cities');
      if (res.data.data && res.data.data.length > 0) {
        setCities(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  useEffect(() => {
    // Load saved city from localStorage; if none, keep empty to force selection
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      setSelectedCity(saved);
    }
    fetchCities();
  }, []);

  // Re-fetch cities when city selector modal opens
  useEffect(() => {
    if (isCityModalOpen) {
      fetchCities();
    }
  }, [isCityModalOpen]);

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
      setIsCityModalOpen,
      isLoadingCities,
      refreshCities: fetchCities,
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);

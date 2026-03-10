
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(null); // 'en', 'hi', or null (not selected)
  const [isLoading, setIsLoading] = useState(true);
  const [isUIReady, setUIReady] = useState(false);
  const [isGuideSeen, setGuideSeenState] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const [storedLanguage, storedGuideSeen] = await Promise.all([
        AsyncStorage.getItem('userLanguage'),
        AsyncStorage.getItem('isGuideSeen')
      ]);

      if (storedLanguage) {
        setLanguage(storedLanguage);
        setUIReady(true);
      }

      if (storedGuideSeen === 'true') {
        setGuideSeenState(true);
      }
    } catch (error) {
      console.error('Failed to load language', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('userLanguage', lang);
      // Reset guide seen when language changes
      await AsyncStorage.setItem('isGuideSeen', 'false');
      setLanguage(lang);
      setGuideSeenState(false);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  };

  const setGuideSeen = async (seen) => {
    try {
      await AsyncStorage.setItem('isGuideSeen', seen.toString());
      setGuideSeenState(seen);
    } catch (error) {
      console.error('Failed to save guide seen state', error);
    }
  };

  const clearLanguage = async () => {
    try {
      await AsyncStorage.removeItem('userLanguage');
      setLanguage(null);
      setUIReady(false);
    } catch (error) {
      console.error("Failed to clear language", error);
    }
  }

  return (
    <LanguageContext.Provider value={{
      language,
      isLoading,
      isUIReady,
      isGuideSeen,
      setUIReady,
      setGuideSeen,
      selectLanguage,
      clearLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

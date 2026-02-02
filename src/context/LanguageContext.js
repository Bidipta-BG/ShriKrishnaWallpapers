
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(null); // 'en', 'hi', or null (not selected)
  const [isLoading, setIsLoading] = useState(true);
  const [isUIReady, setUIReady] = useState(false); // Controls when main screen animations can start

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('userLanguage');
      if (storedLanguage) {
        setLanguage(storedLanguage);
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
      setLanguage(lang);
      // If selecting for first time, we might skip the "Welcome Back" alert or handle it differently.
      // For now, let's assume we want to signal ready immediately if it's a fresh selection?
      // actually App.js will remount.
    } catch (error) {
      console.error('Failed to save language', error);
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
    <LanguageContext.Provider value={{ language, isLoading, isUIReady, setUIReady, selectLanguage, clearLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

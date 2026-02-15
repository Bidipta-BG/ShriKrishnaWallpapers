import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.thevibecoderagency.online/api/srikrishna-aarti/gallery';
const CACHE_KEY = 'gallery_data_cache';
const CACHE_TIMESTAMP_KEY = 'gallery_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const fetchGalleryData = async () => {
    try {
        // 1. Try to get cached data first
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        const cacheTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

        const now = Date.now();
        const isCacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION;

        // 2. If cache is valid, return it immediately
        if (cachedData && isCacheValid) {
            console.log('Using cached gallery data');
            return JSON.parse(cachedData);
        }

        // 3. Fetch fresh data from API
        console.log('Fetching fresh gallery data from API');
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // 4. Save to cache
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

        return data;

    } catch (error) {
        console.error('Error fetching gallery data:', error);

        // 5. If API fails, try to return cached data (even if expired)
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
            console.log('API failed, using stale cache');
            return JSON.parse(cachedData);
        }

        // 6. If no cache exists, throw error
        throw error;
    }
};

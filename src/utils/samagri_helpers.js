import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
const COINS_KEY = 'divyaCoins';
const UNLOCKED_ITEMS_KEY = 'unlockedSamagriItems';
const SELECTED_PUJA_ITEMS_KEY = 'selectedPujaItems';

// Default permanently unlocked items (no expiry)
const DEFAULT_UNLOCKED = ['f1', 'c1', 's1', 't1']; // Marigold, Normal Coins, Shankh, Classic Thali

// Category key mapping for storage
const CATEGORY_KEYS = {
    '🌸 Flowers & Leaves': 'flowers',
    '🔔 Sound': 'sound',
    '🌺 Garlands': 'garlands',
    '🪔 Thali': 'thali',
    '🕯 Dhup & Diya': 'dhup',
    '🍬 Samagri': 'samagri',
    '💰 Coins': 'coins'
};

// Icon mapping for all samagri items
export const ITEM_ICONS = {
    // Flowers & Leaves
    'f1': require('../assets/images/flowers_leafs/marigold.png'),
    'f2': require('../assets/images/flowers_leafs/rose.png'),
    'f3': require('../assets/images/flowers_leafs/bel_patta.png'),
    'f4': require('../assets/images/flowers_leafs/vaijayanti.png'),
    'f5': require('../assets/images/flowers_leafs/jasmine.png'),
    'f6': require('../assets/images/flowers_leafs/madhumalti.png'),
    'f7': require('../assets/images/flowers_leafs/hibiscus.png'),
    'f8': require('../assets/images/flowers_leafs/white_rose.png'),
    'f9': require('../assets/images/flowers_leafs/agastya.png'),
    'f10': require('../assets/images/flowers_leafs/lajvanti.png'),
    'f11': require('../assets/images/flowers_leafs/lotus.png'),
    'f12': require('../assets/images/flowers_leafs/neelkamal.png'),
    // Sound
    's1': require('../assets/images/sound/shankh.png'),
    's2': require('../assets/images/sound/bell.png'),
    's3': require('../assets/images/sound/majira.png'),
    's4': require('../assets/images/sound/drum.png'),
    // Garlands
    'g1': require('../assets/images/garlands/normal_garland.png'),
    'g2': require('../assets/images/garlands/marigold_garland.png'),
    'g3': require('../assets/images/garlands/rose_garland.png'),
    'g4': require('../assets/images/garlands/whitearc_garland.png'),
    // Thali
    't1': require('../assets/images/thali/classic_thali.png'),
    't2': require('../assets/images/thali/silver_thali.png'),
    't3': require('../assets/images/thali/gold_thali.png'),
    't4': require('../assets/images/thali/kundan_thali.png'),
    // Dhup & Diya
    'dd1': require('../assets/images/dhup_dia/oil_dia.png'),
    'dd2': require('../assets/images/dhup_dia/camphor.png'),
    'dd3': require('../assets/images/dhup_dia/dhup.png'),
    'dd4': require('../assets/images/dhup_dia/ghee_dia.png'),
    'dd5': require('../assets/images/dhup_dia/fivefaced_dia.png'),
    // Samagri
    'sa1': require('../assets/images/samagri/nariyal_barfi.png'),
    'sa2': require('../assets/images/samagri/panchamrit.png'),
    'sa3': require('../assets/images/samagri/gangajal.png'),
    'sa4': require('../assets/images/samagri/sandalwood.png'),
    'sa5': require('../assets/images/samagri/besan_laddoo.png'),
    'sa6': require('../assets/images/samagri/boondi_laddoo.png'),
    'sa7': require('../assets/images/samagri/fruits.png'),
    'sa8': require('../assets/images/samagri/kheer.png'),
    'sa9': require('../assets/images/samagri/halwa.png'),
    'sa10': require('../assets/images/samagri/nariyal.png'),
    'sa11': require('../assets/images/samagri/chappan_bhog.png'),
    // Coins
    'c1': require('../assets/images/coins/normal_coins.png'),
    'c2': require('../assets/images/coins/bronze_coins.png'),
    'c3': require('../assets/images/coins/silver_coins.png'),
    'c4': require('../assets/images/coins/gold_coins.png'),
};

// Multi-select categories
const MULTI_SELECT_CATEGORIES = ['flowers', 'samagri', 'coins'];

/**
 * Load user's current coin balance
 */
export const loadUserCoins = async () => {
    try {
        const coins = await AsyncStorage.getItem(COINS_KEY);
        return coins ? parseInt(coins, 10) : 0; // Default 0 for testing
    } catch (error) {
        console.error('Error loading coins:', error);
        return 0; // Default 0 for testing
    }
};

/**
 * Save user's coin balance
 */
export const saveUserCoins = async (coins) => {
    try {
        await AsyncStorage.setItem(COINS_KEY, coins.toString());
    } catch (error) {
        console.error('Error saving coins:', error);
    }
};

/**
 * Load unlocked items and remove expired ones
 */
export const loadUnlockedItems = async () => {
    try {
        const data = await AsyncStorage.getItem(UNLOCKED_ITEMS_KEY);
        const unlocked = data ? JSON.parse(data) : {};

        // Add default unlocked items (permanent)
        DEFAULT_UNLOCKED.forEach(itemId => {
            unlocked[itemId] = { permanent: true };
        });

        // Remove expired items
        const now = Date.now();
        const validItems = {};

        Object.keys(unlocked).forEach(itemId => {
            const item = unlocked[itemId];
            if (item.permanent || (item.expiresAt && item.expiresAt > now)) {
                validItems[itemId] = item;
            }
        });

        // Save cleaned data back
        await AsyncStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(validItems));

        return validItems;
    } catch (error) {
        console.error('Error loading unlocked items:', error);
        // Return default unlocked items on error
        const defaults = {};
        DEFAULT_UNLOCKED.forEach(id => {
            defaults[id] = { permanent: true };
        });
        return defaults;
    }
};

/**
 * Load selected puja items
 */
export const loadSelectedPujaItems = async () => {
    const defaults = {
        flowers: ['f1'],    // Marigold
        sound: 's1',        // Shankh
        garlands: '',
        thali: 't1',        // Classic Thali
        dhup: '',
        samagri: [],
        coins: ['c1']       // Normal Coins
    };

    try {
        const data = await AsyncStorage.getItem(SELECTED_PUJA_ITEMS_KEY);
        if (!data) return defaults;

        const selected = JSON.parse(data);

        // Ensure everything is merged with defaults in case of new/missing fields or old format
        return {
            ...defaults,
            ...selected,
            // Specifically ensure arrays are arrays in case of corrupted data
            flowers: Array.isArray(selected.flowers) ? selected.flowers : defaults.flowers,
            samagri: Array.isArray(selected.samagri) ? selected.samagri : defaults.samagri,
            coins: Array.isArray(selected.coins) ? selected.coins : defaults.coins,
        };
    } catch (error) {
        console.error('Error loading selected items:', error);
        return defaults;
    }
};

/**
 * Unlock an item by purchasing with coins
 */
export const unlockItem = async (itemId, price, categoryName) => {
    try {
        // Load current coins
        const currentCoins = await loadUserCoins();

        // Check if user has enough coins
        if (currentCoins < price) {
            return { success: false, error: 'Not enough coins' };
        }

        // Load unlocked items
        const unlocked = await loadUnlockedItems();

        // Check if already unlocked
        if (unlocked[itemId]) {
            return { success: false, error: 'Already unlocked' };
        }

        // Deduct coins
        const newCoins = currentCoins - price;
        await saveUserCoins(newCoins);

        // Add to unlocked items with 24hr expiry
        const now = Date.now();
        const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
        unlocked[itemId] = { unlockedAt: now, expiresAt };

        await AsyncStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(unlocked));

        // Auto-select the newly unlocked item
        const categoryKey = CATEGORY_KEYS[categoryName];
        await autoSelectItem(itemId, categoryKey);

        return { success: true, newCoins };
    } catch (error) {
        console.error('Error unlocking item:', error);
        return { success: false, error: 'Failed to unlock item' };
    }
};

/**
 * Auto-select a newly unlocked item
 */
const autoSelectItem = async (itemId, categoryKey) => {
    try {
        const selected = await loadSelectedPujaItems();

        if (MULTI_SELECT_CATEGORIES.includes(categoryKey)) {
            // Multi-select: add to array
            if (!selected[categoryKey]) selected[categoryKey] = [];
            if (!selected[categoryKey].includes(itemId)) {
                selected[categoryKey].push(itemId);
            }
        } else {
            // Single-select: replace
            selected[categoryKey] = itemId;
        }

        await AsyncStorage.setItem(SELECTED_PUJA_ITEMS_KEY, JSON.stringify(selected));
    } catch (error) {
        console.error('Error auto-selecting item:', error);
    }
};

/**
 * Toggle item selection
 */
export const toggleItemSelection = async (itemId, categoryName) => {
    try {
        const categoryKey = CATEGORY_KEYS[categoryName];
        const selected = await loadSelectedPujaItems();

        if (MULTI_SELECT_CATEGORIES.includes(categoryKey)) {
            // Multi-select: toggle in array
            if (!selected[categoryKey]) selected[categoryKey] = [];

            const index = selected[categoryKey].indexOf(itemId);
            if (index > -1) {
                selected[categoryKey].splice(index, 1);
            } else {
                selected[categoryKey].push(itemId);
            }
        } else {
            // Single-select: toggle or replace
            if (selected[categoryKey] === itemId) {
                selected[categoryKey] = ''; // Deselect
            } else {
                selected[categoryKey] = itemId; // Select (replaces previous)
            }
        }

        await AsyncStorage.setItem(SELECTED_PUJA_ITEMS_KEY, JSON.stringify(selected));
        return { success: true, selected };
    } catch (error) {
        console.error('Error toggling selection:', error);
        return { success: false };
    }
};

/**
 * Check if an item is unlocked
 */
export const isItemUnlocked = (itemId, unlockedItems) => {
    return !!unlockedItems[itemId];
};

/**
 * Check if an item is selected
 */
export const isItemSelected = (itemId, categoryName, selectedPujaItems) => {
    const categoryKey = CATEGORY_KEYS[categoryName];

    if (MULTI_SELECT_CATEGORIES.includes(categoryKey)) {
        return selectedPujaItems[categoryKey]?.includes(itemId) || false;
    } else {
        return selectedPujaItems[categoryKey] === itemId;
    }
};

/**
 * Check if category is multi-select
 */
export const isMultiSelectCategory = (categoryName) => {
    const categoryKey = CATEGORY_KEYS[categoryName];
    return MULTI_SELECT_CATEGORIES.includes(categoryKey);
};

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import samagriItems from '../assets/data/samagri_items.json';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import {
    isItemSelected,
    isItemUnlocked,
    isMultiSelectCategory,
    ITEM_ICONS,
    loadSelectedPujaItems,
    loadUnlockedItems,
    loadUserCoins,
    toggleItemSelection,
    unlockItem
} from '../utils/samagri_helpers';

const REWARD_ITEM_IDS = ['f1', 's1', 't1', 'c1'];

const STORE_UI_TRANSLATIONS = {
    en: {
        header: 'Divine Samagri Store',
        categories: {
            '🌸 Flowers & Leaves': '🌸 Flowers & Leaves',
            '🔔 Sound': '🔔 Sound',
            '🌺 Garlands': '🌺 Garlands',
            '🪔 Thali': '🪔 Thali',
            '🕯 Dhup & Diya': '🕯 Dhup & Diya',
            '🍬 Samagri': '🍬 Samagri',
            '💰 Coins': '💰 Coins'
        }
    },
    hi: {
        header: 'दिव्य सामग्री स्टोर',
        categories: {
            '🌸 Flowers & Leaves': '🌸 फूल और पत्तियां',
            '🔔 Sound': '🔔 ध्वनि',
            '🌺 Garlands': '🌺 पुष्प माला',
            '🪔 Thali': '🪔 पूजा थाली',
            '🕯 Dhup & Diya': '🕯 धूप और दीप',
            '🍬 Samagri': '🍬 भोग सामग्री',
            '💰 Coins': '💰 दिव्य मुद्रा'
        }
    }
};

const SamagriScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState(samagriItems[0].category);
    const [isRewardActive, setIsRewardActive] = useState(false);
    const [userCoins, setUserCoins] = useState(0);
    const [unlockedItems, setUnlockedItems] = useState({});
    const [selectedPujaItems, setSelectedPujaItems] = useState({});
    const [currentTime, setCurrentTime] = useState(Date.now());
    const { language } = useLanguage();
    const mainListRef = useRef(null);
    const categoryListRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const loadSamagriData = async () => {
                try {
                    // Load reward status
                    const expiry = await AsyncStorage.getItem('samagri_unlock_expiry');
                    if (expiry) {
                        const now = Date.now();
                        setIsRewardActive(now < parseInt(expiry));
                    }

                    // Load coins, unlocked items, and selected items
                    const [coins, unlocked, selected] = await Promise.all([
                        loadUserCoins(),
                        loadUnlockedItems(),
                        loadSelectedPujaItems()
                    ]);

                    setUserCoins(coins);
                    setUnlockedItems(unlocked);
                    setSelectedPujaItems(selected);
                } catch (e) {
                    console.error('Error loading samagri data:', e);
                }
            };
            loadSamagriData();
        }, [])
    );

    // Update current time every minute for countdown
    useFocusEffect(
        useCallback(() => {
            const interval = setInterval(() => {
                setCurrentTime(Date.now());
            }, 60000);
            return () => clearInterval(interval);
        }, [])
    );

    const getExpiryLabel = (itemId) => {
        const item = unlockedItems[itemId];
        if (!item || item.permanent) return null;

        const timeLeft = item.expiresAt - currentTime;
        if (timeLeft <= 0) return null;

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (language === 'hi') {
            return `समाप्ति: ${hours}घं ${minutes}मि`;
        }
        return `Expires in ${hours}h ${minutes}m`;
    };

    const onCategoryPress = (index, categoryName) => {
        setSelectedCategory(categoryName);
        mainListRef.current?.scrollToIndex({ index, animated: true });
    };

    const onScrollEnd = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
        if (samagriItems[index]) {
            setSelectedCategory(samagriItems[index].category);
            categoryListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
    };

    // Handle unlocking an item with coins
    const handleUnlockItem = async (item) => {
        const result = await unlockItem(item.id, item.price, selectedCategory);

        if (result.success) {
            // Update local state
            setUserCoins(result.newCoins);
            const updatedUnlocked = await loadUnlockedItems();
            const updatedSelected = await loadSelectedPujaItems();
            setUnlockedItems(updatedUnlocked);
            setSelectedPujaItems(updatedSelected);

            // Show success toast
            Alert.alert(
                language === 'hi' ? '✨ अनलॉक हो गया!' : '✨ Unlocked!',
                language === 'hi'
                    ? `${item.name_hi || item.name} 24 घंटे के लिए अनलॉक हो गया है`
                    : `${item.name} unlocked for 24 hours`,
                [{ text: language === 'hi' ? 'ठीक है' : 'OK' }]
            );
        } else {
            Alert.alert(
                language === 'hi' ? 'अनलॉक नहीं कर सकते' : 'Cannot Unlock',
                result.error === 'Not enough coins'
                    ? (language === 'hi'
                        ? 'आपके पास पर्याप्त Divya Coins नहीं है। अधिक मुद्रा कमाने के लिए सेटिंग्स में विज्ञापन देखें!'
                        : 'You need more Divya Coins. Watch ads in Settings to earn more!')
                    : result.error,
                [{ text: language === 'hi' ? 'ठीक है' : 'OK' }]
            );
        }
    };

    // Handle toggling item selection
    const handleToggleSelection = async (item) => {
        const result = await toggleItemSelection(item.id, selectedCategory);
        if (result.success) {
            setSelectedPujaItems(result.selected);
        }
    };

    const renderCategoryItem = ({ item, index }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.category && styles.selectedCategoryButton
            ]}
            onPress={() => onCategoryPress(index, item.category)}
        >
            <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.category && styles.selectedCategoryButtonText
            ]}>
                {language === 'hi'
                    ? (STORE_UI_TRANSLATIONS.hi.categories[item.category] || item.category)
                    : item.category}
            </Text>
        </TouchableOpacity>
    );

    const renderStoreItem = ({ item }) => {
        const itemUnlocked = isItemUnlocked(item.id, unlockedItems);
        const itemSelected = isItemSelected(item.id, selectedCategory, selectedPujaItems);
        const isMultiSelect = isMultiSelectCategory(selectedCategory);

        return (
            <TouchableOpacity
                style={[
                    styles.itemCard,
                    !itemUnlocked && styles.lockedItemCard,
                    itemSelected && styles.selectedItemCard
                ]}
                onPress={() => {
                    if (itemUnlocked) {
                        handleToggleSelection(item);
                    } else {
                        handleUnlockItem(item);
                    }
                }}
                activeOpacity={0.7}
            >
                {/* Lock badge for locked items */}
                {!itemUnlocked && (
                    <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={12} color="#fff" />
                    </View>
                )}

                {/* Selection indicator (checkbox/radio) */}
                {itemUnlocked && (
                    <View style={styles.selectionIndicator}>
                        <Ionicons
                            name={isMultiSelect
                                ? (itemSelected ? 'checkbox' : 'square-outline')
                                : (itemSelected ? 'radio-button-on' : 'radio-button-off')
                            }
                            size={20}
                            color={itemSelected ? '#9c6ce6' : '#666'}
                        />
                    </View>
                )}

                <View style={[styles.itemImageContainer, itemSelected && { borderColor: '#9c6ce6', borderWidth: 2 }]}>
                    <Image
                        source={ITEM_ICONS[item.id]}
                        style={[
                            styles.itemIcon,
                            !itemUnlocked && { opacity: 0.8 }
                        ]}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, !itemUnlocked && { color: '#666' }]}>
                        {language === 'hi' ? (item.name_hi || item.name) : item.name}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Ionicons name="flash" size={14} color={itemUnlocked ? "#ffd700" : "#666"} />
                        <Text style={[styles.itemPrice, !itemUnlocked && { color: '#666' }]}>
                            {itemUnlocked
                                ? (getExpiryLabel(item.id) || (language === 'hi' ? 'अनलॉक' : 'Unlocked'))
                                : `${item.price} coins`}
                        </Text>
                    </View>
                </View>

                {!itemUnlocked && (
                    <View style={styles.unlockButton}>
                        <Ionicons name="wallet" size={16} color="#9c6ce6" />
                        <Text style={styles.unlockButtonText}>{item.price}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCategoryGrid = ({ item: categoryData }) => (
        <View style={{ width: Dimensions.get('window').width }}>
            <FlatList
                data={categoryData.items}
                renderItem={renderStoreItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={[styles.itemsList, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    const getIconByCategory = (category) => {
        if (category.includes('Flowers')) return 'flower';
        if (category.includes('Sound')) return 'musical-notes';
        if (category.includes('Garlands')) return 'infinite';
        if (category.includes('Thali')) return 'disc';
        if (category.includes('Dhup')) return 'flame';
        if (category.includes('Samagri')) return 'gift';
        if (category.includes('Coins')) return 'cash';
        return 'star';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.navigate('DailyDarshan')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {language === 'hi' ? STORE_UI_TRANSLATIONS.hi.header : STORE_UI_TRANSLATIONS.en.header}
                </Text>
                <View style={styles.coinBadge}>
                    <Ionicons name="flash" size={16} color="#ffd700" />
                    <Text style={styles.coinBalance}>{userCoins}</Text>
                </View>
            </View>

            {/* Categories Horizontal List */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    ref={categoryListRef}
                    data={samagriItems}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.category}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {/* Main Swipeable Pager */}
            <FlatList
                ref={mainListRef}
                data={samagriItems}
                renderItem={renderCategoryGrid}
                keyExtractor={item => item.category}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                getItemLayout={(data, index) => ({
                    length: Dimensions.get('window').width,
                    offset: Dimensions.get('window').width * index,
                    index,
                })}
                removeClippedSubviews={false} // Important for rendering columns in paging
            />

            {/* Bottom Nav */}
            <View style={styles.bottomNavContainer}>
                <BottomNav navigation={navigation} activeTab="Samagri" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4dabf7',
        letterSpacing: 0.5,
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    coinBalance: {
        color: '#ffd700',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 14,
    },
    categoriesContainer: {
        paddingVertical: 15,
        backgroundColor: '#000',
    },
    categoriesList: {
        paddingHorizontal: 15,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    selectedCategoryButton: {
        backgroundColor: '#9c6ce6',
        borderColor: '#9c6ce6',
    },
    categoryButtonText: {
        color: '#aaa',
        fontWeight: 'bold',
        fontSize: 13,
    },
    selectedCategoryButtonText: {
        color: '#fff',
    },
    itemsList: {
        paddingHorizontal: 5,
    },
    itemCard: {
        flex: 1 / 3, // Ensure strict 3-column width
        backgroundColor: '#121212',
        margin: 5,
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1f1f1f',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    itemImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    itemIcon: {
        width: 45,
        height: 45,
    },
    itemInfo: {
        alignItems: 'center',
        marginBottom: 10,
    },
    itemName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    itemPrice: {
        color: '#ffd700',
        fontSize: 10,
        fontWeight: '600',
    },
    buyButton: {
        backgroundColor: '#222',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#4dabf7',
    },
    buyButtonText: {
        color: '#4dabf7',
        fontWeight: 'bold',
        fontSize: 12,
    },
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    unlockedItemCard: {
        borderColor: '#ffd700',
        backgroundColor: '#1a1a10',
    },
    rewardBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ffd700',
        padding: 4,
        borderRadius: 10,
        zIndex: 10,
    },
    activeButton: {
        backgroundColor: '#ffd700',
        borderColor: '#ffd700',
    },
    activeButtonText: {
        color: '#000',
    },
    lockBadge: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        borderRadius: 10,
        padding: 4,
        zIndex: 10,
    },
    lockedItemCard: {
        borderColor: '#ff6b6b',
        borderWidth: 2,
    },
    selectionIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    selectedItemCard: {
        borderColor: '#9c6ce6',
        borderWidth: 2,
        backgroundColor: '#1a1a2a',
        shadowColor: '#9c6ce6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(156, 108, 230, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#9c6ce6',
        gap: 5,
    },
    unlockButtonText: {
        color: '#9c6ce6',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default SamagriScreen;

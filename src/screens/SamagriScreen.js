import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import samagriItems from '../assets/data/samagri_items.json';
import BottomNav from '../components/BottomNav';
import {
    isItemSelected,
    isItemUnlocked,
    isMultiSelectCategory,
    loadSelectedPujaItems,
    loadUnlockedItems,
    loadUserCoins,
    toggleItemSelection,
    unlockItem
} from '../utils/samagri_helpers';

const REWARD_ITEM_IDS = ['f1', 's1', 't1', 'c1'];

// Icon mapping for all samagri items
const ITEM_ICONS = {
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

const SamagriScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState(samagriItems[0].category);
    const [isRewardActive, setIsRewardActive] = useState(false);
    const [userCoins, setUserCoins] = useState(0);
    const [unlockedItems, setUnlockedItems] = useState({});
    const [selectedPujaItems, setSelectedPujaItems] = useState({});
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
                '✨ Unlocked!',
                `${item.name} unlocked for 24 hours`,
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert(
                'Cannot Unlock',
                result.error === 'Not enough coins'
                    ? 'You need more Divya Coins. Watch ads in Settings to earn more!'
                    : result.error,
                [{ text: 'OK' }]
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
                {item.category}
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
                    <Text style={[styles.itemName, !itemUnlocked && { color: '#666' }]}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        <Ionicons name="flash" size={14} color={itemUnlocked ? "#ffd700" : "#666"} />
                        <Text style={[styles.itemPrice, !itemUnlocked && { color: '#666' }]}>
                            {itemUnlocked ? 'Unlocked' : `${item.price} coins`}
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
                <Text style={styles.headerTitle}>Divine Samagri Store</Text>
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

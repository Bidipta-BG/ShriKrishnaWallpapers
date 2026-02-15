import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import samagriItems from '../assets/data/samagri_items.json';
import BottomNav from '../components/BottomNav';

const REWARD_ITEM_IDS = ['f1', 's1', 't1', 'c1'];

const SamagriScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState(samagriItems[0].category);
    const [isRewardActive, setIsRewardActive] = useState(false);
    const mainListRef = useRef(null);
    const categoryListRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const checkRewardStatus = async () => {
                try {
                    const expiry = await AsyncStorage.getItem('samagri_unlock_expiry');
                    if (expiry) {
                        const now = Date.now();
                        setIsRewardActive(now < parseInt(expiry));
                    }
                } catch (e) {
                    console.error('Error checking reward status:', e);
                }
            };
            checkRewardStatus();
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
        const isUnlocked = isRewardActive && REWARD_ITEM_IDS.includes(item.id);

        return (
            <View style={[styles.itemCard, isUnlocked && styles.unlockedItemCard]}>
                {isUnlocked && (
                    <View style={styles.rewardBadge}>
                        <Ionicons name="gift" size={10} color="#FFF" />
                    </View>
                )}
                <View style={[styles.itemImageContainer, isUnlocked && { borderColor: '#ffd700' }]}>
                    <Ionicons
                        name={getIconByCategory(selectedCategory)}
                        size={40}
                        color={isUnlocked ? "#ffd700" : "#9c6ce6"}
                    />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        <Ionicons name="flash" size={14} color="#ffd700" />
                        <Text style={styles.itemPrice}>{isUnlocked ? 'FREE' : `${item.price} Divya Coins`}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.buyButton, isUnlocked && styles.activeButton]}
                    disabled={isUnlocked}
                >
                    <Text style={[styles.buyButtonText, isUnlocked && styles.activeButtonText]}>
                        {isUnlocked ? 'Active' : 'Get'}
                    </Text>
                </TouchableOpacity>
            </View>
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
                    <Text style={styles.coinBalance}>0</Text>
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
});

export default SamagriScreen;

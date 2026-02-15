import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import samagriItems from '../assets/data/samagri_items.json';
import BottomNav from '../components/BottomNav';

const SamagriScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState(samagriItems[0].category);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(item.category)}
        >
            <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.category && styles.selectedCategoryButtonText
            ]}>
                {item.category}
            </Text>
        </TouchableOpacity>
    );

    const renderStoreItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemImageContainer}>
                <Ionicons
                    name={getIconByCategory(selectedCategory)}
                    size={40}
                    color="#9c6ce6"
                />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.priceContainer}>
                    <Ionicons name="flash" size={14} color="#ffd700" />
                    <Text style={styles.itemPrice}>{item.price} Divya Coins</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Get</Text>
            </TouchableOpacity>
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

    const currentItems = samagriItems.find(c => c.category === selectedCategory)?.items || [];

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
                    data={samagriItems}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.category}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {/* Items Vertical Grid/List */}
            <FlatList
                data={currentItems}
                renderItem={renderStoreItem}
                keyExtractor={item => item.id}
                numColumns={3}
                key={`store-grid-3`} // Force re-render when numColumns changes
                contentContainerStyle={[styles.itemsList, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
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
});

export default SamagriScreen;

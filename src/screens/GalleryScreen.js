import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GalleryScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('New'); // 'New', 'Popular', 'Favourite'
    const [favoriteImages, setFavoriteImages] = useState([]);

    const tabs = ['New', 'Popular', 'Favourite'];

    // Gallery Data
    const imageUrls = [
        'https://i.pinimg.com/736x/bf/4e/03/bf4e03638e1707736dca726fc9cdf3af.jpg',
        'https://i.pinimg.com/736x/fe/3f/e3/fe3fe3e0e766cec2de8ef7b72168552d.jpg',
        'https://i.pinimg.com/474x/7c/c4/11/7cc4114fa476d4c4c1f2230e3d9cccb0.jpg',
        'https://i.pinimg.com/564x/c5/83/de/c583de229e5c7ab2fef9545c412d683d.jpg',
        'https://www.wallsnapy.com/img_gallery/sri-krishna-2018-hd-images-3202036.jpg',
        'https://i.pinimg.com/564x/29/3b/f0/293bf0b598955505d173f6d74cb2a993.jpg',
        'https://www.wallsnapy.com/img_gallery/sri-krishna-radha-hd-wallpaper-7457884.jpg',
        'https://m.media-amazon.com/images/I/710cyWZ1oSL._AC_UF894,1000_QL80_.jpg'
    ];

    // Create a larger list for demo purposes (repeating the list 3 times)
    const dummyImages = [...imageUrls, ...imageUrls, ...imageUrls].map((url, index) => ({ uri: url, id: index.toString() }));

    const loadFavorites = async () => {
        try {
            const storedFavs = await AsyncStorage.getItem('favourite_images_list');
            if (storedFavs) {
                setFavoriteImages(JSON.parse(storedFavs));
            } else {
                setFavoriteImages([]);
            }
        } catch (error) {
            console.log("Error loading favorites:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    // Reload when tab changes to Favourite
    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'Favourite') {
                loadFavorites();
            }
        }, [activeTab])
    );

    // Determine data source
    const displayedImages = activeTab === 'Favourite' ? favoriteImages : dummyImages;

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Images</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                        {tab === 'New' ? 'New Image' : tab === 'Popular' ? 'Popular Image' : 'Favourite Image'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const handleImageSelect = async (item) => {
        try {
            await AsyncStorage.setItem('saved_background_image', item.uri);
            Alert.alert(
                "Wallpaper Set!",
                "Would you like to go back to the main screen or stay here?",
                [
                    {
                        text: "OK",
                        style: "cancel"
                    },
                    {
                        text: "Go Back",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.log("Error saving image:", error);
            Alert.alert("Error", "Failed to set wallpaper.");
        }
    };

    const renderImageItem = ({ item }) => (
        <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleImageSelect(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.image} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Favorites Yet</Text>
            <Text style={styles.emptySubText}>Tap the ❤️ icon on Daily Darshan to add here.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <View style={styles.content}>
                {renderTabs()}

                <FlatList
                    data={displayedImages}
                    renderItem={renderImageItem}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    key={2} // Force re-render when columns change
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={activeTab === 'Favourite' ? renderEmptyState : null}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8E1', // Light cream background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#CD9730', // Gold/DarkYellow
        elevation: 5,
        top: 0
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        elevation: 2,
    },
    tabItem: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeTabItem: {
        backgroundColor: '#CD9730',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    gridContainer: {
        padding: 5,
    },
    imageContainer: {
        flex: 1 / 2, // 2 columns
        aspectRatio: 1,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
});

export default GalleryScreen;

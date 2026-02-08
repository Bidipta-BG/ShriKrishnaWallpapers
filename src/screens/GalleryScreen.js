import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
    en: {
        allImages: 'All Images',
        newImage: 'New Image',
        wallpaperSetTitle: 'Wallpaper Set!',
        wallpaperSetMsg: 'Would you like to go back to the main screen or stay here?',
        ok: 'OK',
        goBack: 'Go Back',
        error: 'Error',
        failedSetting: 'Failed to set wallpaper.',
    },
    hi: {
        allImages: 'सभी चित्र',
        newImage: 'नया चित्र',
        wallpaperSetTitle: 'वॉलपेपर सेट!',
        wallpaperSetMsg: 'क्या आप मुख्य स्क्रीन पर वापस जाना चाहते हैं या यहीं रहना चाहते हैं?',
        ok: 'ठीक है',
        goBack: 'वापस जाएं',
        error: 'त्रुटि',
        failedSetting: 'वॉलपेपर सेट करने में विफल।',
    }
};

const { width } = Dimensions.get('window');

const GalleryScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

    const [activeTab, setActiveTab] = useState('New'); // Only 'New' remains
    const tabs = ['New'];

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

    // Mock Backend Data with Metadata
    const dummyImages = [
        // Bundled Local Image (Offline Support)
        {
            id: 'default_local',
            uri: Image.resolveAssetSource(require('../assets/images/default_darshan.jpg')).uri,
            likes: 1250,
            addedAt: Date.now()
        },
        ...imageUrls.map((url, index) => ({
            id: `img_${index}`,
            uri: url,
            likes: Math.floor(Math.random() * 500),
            addedAt: Date.now() - (index * 1000 * 60 * 60 * 24) // offset by days
        }))
    ];


    // Determine data source and sort
    const getDisplayedImages = () => {
        return [...dummyImages]; // No sorting or filtering needed anymore
    };

    const displayedImages = getDisplayedImages();

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.allImages}</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, styles.activeTabItem]}
                    activeOpacity={1}
                >
                    <Text style={[styles.tabText, styles.activeTabText]}>
                        {t.allImages}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const handleImageSelect = async (item) => {
        try {
            await AsyncStorage.setItem('saved_background_image', item.uri);
            Alert.alert(
                t.wallpaperSetTitle,
                t.wallpaperSetMsg,
                [
                    {
                        text: t.ok,
                        style: "cancel"
                    },
                    {
                        text: t.goBack,
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.log("Error saving image:", error);
            Alert.alert(t.error, t.failedSetting);
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
                    ListEmptyComponent={null}
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

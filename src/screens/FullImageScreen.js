import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER_IMAGE = require('../assets/images/default_darshan.jpg');

const SAVED_IMAGES_KEY = 'saved_images_ids';
const SAVE_CAPACITY_KEY = 'save_capacity';
const COINS_KEY = 'divyaCoins';

const FullImageScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const initialIndex = route.params?.initialIndex ?? 0;
    const passedImages = route.params?.allImages || [];

    const [allImages, setAllImages] = useState(passedImages);
    const [isLoading, setIsLoading] = useState(passedImages.length === 0);

    // Ensure initialIndex is valid
    const validInitialIndex = (initialIndex >= 0 && initialIndex < (allImages.length || passedImages.length)) ? initialIndex : 0;

    const [currentIndex, setCurrentIndex] = useState(validInitialIndex);
    const [savedIds, setSavedIds] = useState([]);
    const [saveCapacity, setSaveCapacity] = useState(5);
    const [divyaCoins, setDivyaCoins] = useState(0);
    const [isLimitModalVisible, setLimitModalVisible] = useState(false);
    const [isLowCoinVisible, setLowCoinVisible] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadGalleryImages();
        loadData();
    }, []);

    const loadGalleryImages = async () => {
        try {
            // If images were passed from GalleryScreen, use them directly
            if (passedImages && passedImages.length > 0) {
                console.log('Using passed images (no API call needed)');
                setAllImages(passedImages);
                setIsLoading(false);
                return;
            }

            // Otherwise, fetch from API (fallback for deep links)
            console.log('Fetching images from API');
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/gallery');
            const data = await response.json();

            // Build a flat array of all images from heroSections and categories
            const flatImages = [];
            const seenIds = new Set();

            // Add images from hero sections
            data.heroSections.forEach(section => {
                section.items.forEach(item => {
                    if (!seenIds.has(item.id)) {
                        flatImages.push(item);
                        seenIds.add(item.id);
                    }
                });
            });

            // Add images from categories
            data.categories.forEach(category => {
                category.items.forEach(item => {
                    if (!seenIds.has(item.id)) {
                        flatImages.push(item);
                        seenIds.add(item.id);
                    }
                });
            });

            // Sort by globalIndex to maintain order
            flatImages.sort((a, b) => a.globalIndex - b.globalIndex);

            setAllImages(flatImages);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load images:', error);
            setIsLoading(false);
        }
    };

    const loadData = async () => {
        try {
            const [storedIds, storedCapacity, storedCoins] = await Promise.all([
                AsyncStorage.getItem(SAVED_IMAGES_KEY),
                AsyncStorage.getItem(SAVE_CAPACITY_KEY),
                AsyncStorage.getItem(COINS_KEY)
            ]);

            if (storedIds) setSavedIds(JSON.parse(storedIds));
            if (storedCapacity) setSaveCapacity(parseInt(storedCapacity));
            if (storedCoins) setDivyaCoins(parseInt(storedCoins));

        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const toggleSave = async (id) => {
        try {
            let newSavedIds = [...savedIds];
            const isAlreadySaved = newSavedIds.includes(id);

            if (isAlreadySaved) {
                newSavedIds = newSavedIds.filter(savedId => savedId !== id);
            } else {
                if (newSavedIds.length >= saveCapacity) {
                    setLimitModalVisible(true);
                    return;
                }
                newSavedIds.push(id);
            }

            setSavedIds(newSavedIds);
            await AsyncStorage.setItem(SAVED_IMAGES_KEY, JSON.stringify(newSavedIds));
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const purchaseCapacity = async () => {
        if (divyaCoins < 1) {
            setLowCoinVisible(true);
            return;
        }

        try {
            const newCoins = divyaCoins - 1;
            const newCapacity = saveCapacity + 2;

            setDivyaCoins(newCoins);
            setSaveCapacity(newCapacity);
            setLimitModalVisible(false);

            await Promise.all([
                AsyncStorage.setItem(COINS_KEY, newCoins.toString()),
                AsyncStorage.setItem(SAVE_CAPACITY_KEY, newCapacity.toString())
            ]);

            Alert.alert('Blessed!', 'Your divine storage has been expanded by 2 slots.');
        } catch (error) {
            console.error('Error purchasing capacity:', error);
        }
    };

    const setPujaBackground = async (source) => {
        try {
            let uriToSave;
            if (typeof source === 'number') {
                uriToSave = Image.resolveAssetSource(source).uri;
            } else {
                uriToSave = source.uri || source;
            }

            await AsyncStorage.setItem('saved_background_image', uriToSave);
            Alert.alert(
                'Daily Darshan Image Updated',
                'Puja background updated successfully! Your Daily Darshan screen now features this divine form of Shri Krishna.',
                [{ text: 'Ok' }]
            );
        } catch (error) {
            console.error('Error setting puja background:', error);
            Alert.alert('Error', 'Failed to update Puja background.');
        }
    };

    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(contentOffset / height);
        if (index !== currentIndex && index >= 0 && index < allImages.length) {
            setCurrentIndex(index);
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ width, height }}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
                defaultSource={PLACEHOLDER_IMAGE}
                onError={(e) => console.log('Full image failed to load:', item.imageUrl)}
            />
        </View>
    );

    const currentItem = allImages[currentIndex];

    // Loading state
    if (isLoading || allImages.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                <View style={[styles.header, { top: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff' }}>Loading...</Text>
                </View>
            </View>
        );
    }

    // Safeguard in case currentIndex is out of bounds
    if (!currentItem) return null;

    const isSaved = savedIds.includes(currentItem.id);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <FlatList
                ref={flatListRef}
                data={allImages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={handleScroll}
                getItemLayout={(data, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
                initialScrollIndex={validInitialIndex}
            />

            {/* Top Overlay UI */}
            <View style={[styles.header, { top: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.savedButtonContainer}
                    onPress={() => navigation.navigate('Saved')}
                >
                    <View style={styles.savedButtonCircle}>
                        <Ionicons name="bookmark" size={14} color="#ffd700" />
                        <Text style={styles.savedText}>SAVED</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom Button Group */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setPujaBackground(currentItem.imageUrl)}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="image-outline" size={24} color="#4dabf7" />
                        </View>
                        <Text style={styles.buttonLabel}>Puja Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleSave(currentItem.id)}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons
                                name={isSaved ? "bookmark" : "bookmark-outline"}
                                size={24}
                                color={isSaved ? "#9c6ce6" : "#fff"}
                            />
                        </View>
                        <Text style={[styles.buttonLabel, isSaved && { color: '#9c6ce6' }]}>
                            {isSaved ? 'Saved' : 'Save'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ImageShare', {
                            imageSource: currentItem.imageUrl,
                            imageId: currentItem.id
                        })}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="share-social-outline" size={24} color="#4dabf7" />
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{currentItem.shares}</Text>
                            </View>
                        </View>
                        <Text style={styles.buttonLabel}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ImageDownload', {
                            imageSource: currentItem.imageUrl,
                            imageId: currentItem.id
                        })}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="cloud-download-outline" size={24} color="#9c6ce6" />
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{currentItem.downloads}</Text>
                            </View>
                        </View>
                        <Text style={styles.buttonLabel}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Capacity Limit Modal */}
            <Modal
                visible={isLimitModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLimitModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="bookmark" size={40} color="#9c6ce6" />
                            <Text style={styles.modalTitle}>Divine Storage Full</Text>
                        </View>

                        <Text style={styles.modalText}>
                            Your capacity is limited to {saveCapacity} sacred images. Unsave some or expand your storage to save more.
                        </Text>

                        <Text style={styles.coinBalance}>
                            Current Balance: <Ionicons name="flash" size={14} color="#ffd700" /> {divyaCoins} Divya Coins
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setLimitModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Maybe Later</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.buyBtn]}
                                onPress={purchaseCapacity}
                            >
                                <View style={styles.buyBtnContent}>
                                    <Text style={styles.buyBtnText}>+2 Slots (1 Coin)</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Low Coin Redirect Modal */}
            <Modal
                visible={isLowCoinVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLowCoinVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: '#ffd700' }]}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="flash" size={40} color="#ffd700" />
                            <Text style={[styles.modalTitle, { color: '#ffd700' }]}>Insufficient Coins</Text>
                        </View>

                        <Text style={styles.modalText}>
                            You need 1 Divya Coin to expand your divine storage. Get more coins to continue saving your favorite sacred wallpapers.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setLowCoinVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#ffd700' }]}
                                onPress={() => {
                                    setLowCoinVisible(false);
                                    setLimitModalVisible(false);
                                    // Future: navigation.navigate('Store')
                                    Alert.alert('Coming Soon', 'The Divine Store is being prepared by the devas. Check back soon!');
                                }}
                            >
                                <Text style={[styles.buyBtnText, { color: '#000' }]}>Get More Coins</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        backgroundColor: '#000',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    header: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    headerButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    savedButtonContainer: {
        width: 80,
        alignItems: 'flex-end',
    },
    savedButtonCircle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    savedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1f1f1f',
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    countBadge: {
        position: 'absolute',
        top: -8,
        right: -12,
        backgroundColor: '#9c6ce6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    countText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#161616',
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalText: {
        color: '#aaa',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    coinBalance: {
        color: '#ffd700',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 25,
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#444',
    },
    buyBtn: {
        backgroundColor: '#9c6ce6',
    },
    cancelBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    buyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buyBtnContent: {
        alignItems: 'center',
    }
});

export default FullImageScreen;

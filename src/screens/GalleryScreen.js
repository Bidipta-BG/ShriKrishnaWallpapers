import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

const PLACEHOLDER_IMAGE = require('../assets/images/default_darshan.jpg');

const { width } = Dimensions.get('window');
// Padding: 20 (List) + 8 (Card Margin) = 28 total offset from left.
// We want 1.0 item + 0.7 item + 16px gap to fit in the remaining width.
const ITEM_WIDTH = (width - 44) / 1.7;

const GalleryScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [galleryData, setGalleryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load gallery data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadGalleryData();
        }, [])
    );

    // Validate API response structure
    const validateGalleryData = (data) => {
        if (!data) throw new Error('No data received from server');

        if (!data.promoBanner || typeof data.promoBanner !== 'object') {
            throw new Error('Invalid promoBanner data');
        }

        if (!Array.isArray(data.heroSections)) {
            throw new Error('Invalid heroSections data');
        }

        if (!Array.isArray(data.categories)) {
            throw new Error('Invalid categories data');
        }

        // Validate each hero section has required fields
        data.heroSections.forEach((section, index) => {
            if (!section.id || !section.title || !Array.isArray(section.items)) {
                throw new Error(`Invalid hero section at index ${index}`);
            }
        });

        // Validate each category has required fields
        data.categories.forEach((category, index) => {
            if (!category.id || !category.title || !Array.isArray(category.items)) {
                throw new Error(`Invalid category at index ${index}`);
            }
        });

        return true;
    };

    const loadGalleryData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/gallery');

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Validate the response
            validateGalleryData(data);

            setGalleryData(data);
        } catch (err) {
            console.error('Failed to load gallery:', err);

            // User-friendly error messages
            let errorMessage = 'Unable to load gallery content.';

            if (err.message.includes('Network request failed') || err.name === 'TypeError') {
                errorMessage = 'No internet connection. Please check your network and try again.';
            } else if (err.message.includes('Server error')) {
                errorMessage = 'Server is temporarily unavailable. Please try again later.';
            } else if (err.message.includes('Invalid')) {
                errorMessage = 'Received invalid data from server. Please try again.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Build flat array of all images for FullImageScreen
    const buildFlatImageArray = () => {
        if (!galleryData) return [];

        const flatImages = [];
        const seenIds = new Set();

        // Add images from hero sections
        galleryData.heroSections.forEach(section => {
            section.items.forEach(item => {
                if (!seenIds.has(item.id)) {
                    flatImages.push(item);
                    seenIds.add(item.id);
                }
            });
        });

        // Add images from categories
        galleryData.categories.forEach(category => {
            category.items.forEach(item => {
                if (!seenIds.has(item.id)) {
                    flatImages.push(item);
                    seenIds.add(item.id);
                }
            });
        });

        // Sort by globalIndex
        flatImages.sort((a, b) => a.globalIndex - b.globalIndex);

        return flatImages;
    };

    const renderHorizontalItem = ({ item }) => (
        <TouchableOpacity
            style={styles.horizontalCard}
            onPress={() => navigation.navigate('FullImage', {
                initialIndex: item.globalIndex,
                allImages: buildFlatImageArray() // Pass pre-built array
            })}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                defaultSource={PLACEHOLDER_IMAGE}
                onError={(e) => console.log('Image failed to load:', item.imageUrl)}
            />
        </TouchableOpacity>
    );

    const renderExploreItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.exploreCard}
            onPress={() => navigation.navigate('CategoryGrid', {
                title: item.title,
                items: item.items,
                allImages: buildFlatImageArray() // Pass for FullImage navigation
            })}
        >
            <View style={styles.exploreCardLeft}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.exploreThumb}
                    defaultSource={PLACEHOLDER_IMAGE}
                    onError={(e) => console.log('Thumbnail failed to load:', item.thumbnailUrl)}
                />
                <Text style={styles.exploreTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9c6ce6" />
        </TouchableOpacity>
    );

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="information-circle-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shri Krishna</Text>
                    <View style={styles.noAdsContainer}>
                        <View style={styles.noAdsCircle}>
                            <Ionicons name="ban" size={14} color="#ff4444" />
                            <Text style={styles.adsText}>NO ADS</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#4dabf7" />
                    <Text style={styles.loadingText}>Loading divine content...</Text>
                </View>
                <View style={styles.bottomNavContainer}>
                    <BottomNav navigation={navigation} activeTab="Image" />
                </View>
            </View>
        );
    }

    // Error state
    if (error || !galleryData) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="information-circle-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Shri Krishna</Text>
                    <View style={styles.noAdsContainer}>
                        <View style={styles.noAdsCircle}>
                            <Ionicons name="ban" size={14} color="#ff4444" />
                            <Text style={styles.adsText}>NO ADS</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.centerContent}>
                    <Ionicons name="cloud-offline-outline" size={60} color="#9c6ce6" />
                    <Text style={styles.errorText}>{error || 'Failed to load content'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadGalleryData}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomNavContainer}>
                    <BottomNav navigation={navigation} activeTab="Image" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.headerIcon}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="information-circle-outline" size={26} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Shri Krishna</Text>

                <TouchableOpacity style={styles.noAdsContainer}>
                    <View style={styles.noAdsCircle}>
                        <Ionicons name="ban" size={14} color="#ff4444" />
                        <Text style={styles.adsText}>NO ADS</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {/* Dynamic Festival Promotion Banner */}
                {galleryData.promoBanner.isVisible && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => Linking.openURL(galleryData.promoBanner.targetUrl)}
                        style={styles.bannerContainer}
                    >
                        <LinearGradient
                            colors={galleryData.promoBanner.colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bannerGradient}
                        >
                            <View style={styles.bannerContent}>
                                <View style={styles.bannerLeft}>
                                    <View style={styles.festBadge}>
                                        <Text style={styles.festBadgeText}>
                                            {galleryData.promoBanner.daysLeft} DAYS LEFT
                                        </Text>
                                    </View>
                                    <Text style={styles.bannerTitle}>{galleryData.promoBanner.title}</Text>
                                    <Text style={styles.bannerSubtitle}>{galleryData.promoBanner.subtitle}</Text>
                                </View>

                                <View style={styles.bannerRight}>
                                    <View style={styles.installBtn}>
                                        <Text style={styles.installBtnText}>{galleryData.promoBanner.actionText}</Text>
                                        <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Dynamic Hero Sections (Horizontal) */}
                {galleryData.heroSections.map(section => (
                    <View key={section.id} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <TouchableOpacity
                                style={styles.viewAllBtn}
                                onPress={() => navigation.navigate('CategoryGrid', { title: section.title, items: section.items })}
                            >
                                <Text style={styles.viewAllText}>View All</Text>
                                <Ionicons name="chevron-forward" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={section.items}
                            renderItem={renderHorizontalItem}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            snapToInterval={ITEM_WIDTH + 16}
                            decelerationRate="fast"
                        />
                    </View>
                ))}

                {/* All Categories (Vertical Cards) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginLeft: 20, marginBottom: 15, color: '#9c6ce6' }]}>All Category</Text>
                    <View style={styles.exploreGrid}>
                        {galleryData.categories.map(renderExploreItem)}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNavContainer}>
                <BottomNav navigation={navigation} activeTab="Image" />
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
        paddingBottom: 20,
        backgroundColor: '#000',
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4dabf7', // Neon blue primary
        letterSpacing: 0.5,
    },
    noAdsContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    noAdsCircle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    adsText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4dabf7',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9c6ce6', // Vibrant purple
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    viewAllText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    horizontalList: {
        paddingHorizontal: 20,
    },
    horizontalCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.3,
        marginHorizontal: 8,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    exploreGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    exploreCard: {
        width: '48%',
        backgroundColor: '#121212',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1f1f1f',
    },
    exploreCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    exploreThumb: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    exploreTitle: {
        color: '#e0e0e0',
        fontSize: 12,
        fontWeight: '700',
    },
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
    },
    // Banner Styles
    bannerContainer: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4e54c8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bannerGradient: {
        padding: 20,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerLeft: {
        flex: 1,
        marginRight: 15,
    },
    festBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    festBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bannerSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        lineHeight: 18,
    },
    bannerRight: {
        alignItems: 'center',
    },
    installBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    installBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
    },
    retryButton: {
        backgroundColor: '#9c6ce6',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GalleryScreen;

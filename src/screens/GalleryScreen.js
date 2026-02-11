import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
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

const { width } = Dimensions.get('window');
// Padding: 20 (List) + 8 (Card Margin) = 28 total offset from left.
// We want 1.0 item + 0.7 item + 16px gap to fit in the remaining width.
const ITEM_WIDTH = (width - 44) / 1.7;

// This structure mirrors a typical backend response
const GALLERY_DATA = {
    promoBanner: {
        isVisible: true,
        title: "Maha Shivratri is Coming! 🔱",
        subtitle: "Deepen your devotion. Install our Divine Shivji App for Aarti & Mantras.",
        actionText: "Install Now",
        daysLeft: 5,
        targetUrl: "https://play.google.com/store/apps/details?id=com.shrikrishna.daily.puja.aarti", // Example URL
        colors: ['#4e54c8', '#8f94fb'], // Deep purple/blue gradient
    },
    heroSections: [
        {
            id: 'shivratri',
            title: 'Maha Shivratri 2026',
            items: [
                { id: '1', source: require('../assets/images/test_img1.jpg'), globalIndex: 0 },
                { id: '2', source: require('../assets/images/test_img2.jpg'), globalIndex: 1 },
                { id: '3', source: require('../assets/images/test_img3.jpg'), globalIndex: 2 },
            ]
        },
        {
            id: 'monday',
            title: 'Monday Special',
            items: [
                { id: '4', source: require('../assets/images/test_img4.jpg'), globalIndex: 3 },
                { id: '5', source: require('../assets/images/test_img5.jpg'), globalIndex: 4 },
                { id: '6', source: require('../assets/images/test_img6.jpg'), globalIndex: 5 },
            ]
        }
    ],
    categories: [
        {
            id: '1',
            title: 'Nanha Kanhiya',
            source: require('../assets/images/test_img1.jpg'),
            globalIndex: 0,
            items: [
                { id: 'c1_1', source: require('../assets/images/test_img1.jpg'), globalIndex: 0 },
                { id: 'c1_2', source: require('../assets/images/test_img2.jpg'), globalIndex: 1 },
                { id: 'c1_3', source: require('../assets/images/test_img3.jpg'), globalIndex: 2 },
                { id: 'c1_4', source: require('../assets/images/test_img4.jpg'), globalIndex: 3 },
            ]
        },
        {
            id: '2',
            title: 'Radha Krishna',
            source: require('../assets/images/test_img6.jpg'),
            globalIndex: 5,
            items: [
                { id: 'c2_1', source: require('../assets/images/test_img6.jpg'), globalIndex: 5 },
                { id: 'c2_2', source: require('../assets/images/test_img7.jpg'), globalIndex: 6 },
                { id: 'c2_3', source: require('../assets/images/test_img8.jpg'), globalIndex: 7 },
            ]
        },
        {
            id: '3',
            title: 'Makkhan Chor',
            source: require('../assets/images/test_img3.jpg'),
            globalIndex: 2,
            items: [
                { id: 'c3_1', source: require('../assets/images/test_img3.jpg'), globalIndex: 2 },
                { id: 'c3_2', source: require('../assets/images/test_img4.jpg'), globalIndex: 3 },
            ]
        },
        { id: '4', title: 'Govardhan Nath', source: require('../assets/images/test_img5.jpg'), globalIndex: 4, items: [] },
        { id: '5', title: 'Banke Bihari', source: require('../assets/images/test_img8.jpg'), globalIndex: 7, items: [] },
        { id: '6', title: 'Dwarkadhish', source: require('../assets/images/test_img10.jpg'), globalIndex: 9, items: [] },
    ]
};

const GalleryScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const renderHorizontalItem = ({ item }) => (
        <TouchableOpacity
            style={styles.horizontalCard}
            onPress={() => navigation.navigate('FullImage', { initialIndex: item.globalIndex })}
        >
            <Image source={item.source} style={styles.cardImage} />
        </TouchableOpacity>
    );

    const renderExploreItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.exploreCard}
            onPress={() => navigation.navigate('CategoryGrid', { title: item.title, items: item.items })}
        >
            <View style={styles.exploreCardLeft}>
                <Image source={item.source} style={styles.exploreThumb} />
                <Text style={styles.exploreTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9c6ce6" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.headerIcon}>
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
                {GALLERY_DATA.promoBanner.isVisible && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => Linking.openURL(GALLERY_DATA.promoBanner.targetUrl)}
                        style={styles.bannerContainer}
                    >
                        <LinearGradient
                            colors={GALLERY_DATA.promoBanner.colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bannerGradient}
                        >
                            <View style={styles.bannerContent}>
                                <View style={styles.bannerLeft}>
                                    <View style={styles.festBadge}>
                                        <Text style={styles.festBadgeText}>
                                            {GALLERY_DATA.promoBanner.daysLeft} DAYS LEFT
                                        </Text>
                                    </View>
                                    <Text style={styles.bannerTitle}>{GALLERY_DATA.promoBanner.title}</Text>
                                    <Text style={styles.bannerSubtitle}>{GALLERY_DATA.promoBanner.subtitle}</Text>
                                </View>

                                <View style={styles.bannerRight}>
                                    <View style={styles.installBtn}>
                                        <Text style={styles.installBtnText}>{GALLERY_DATA.promoBanner.actionText}</Text>
                                        <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Dynamic Hero Sections (Horizontal) */}
                {GALLERY_DATA.heroSections.map(section => (
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
                        {GALLERY_DATA.categories.map(renderExploreItem)}
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
});

export default GalleryScreen;

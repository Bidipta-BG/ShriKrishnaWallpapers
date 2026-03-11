import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    LayoutAnimation,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../contexts/LoadingContext';
import { loadSlokaProgress } from '../utils/sloka_helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SlokaChapterListScreen = ({ navigation, route }) => {
    const { book } = route.params;
    const { language } = useLanguage();
    const isHindi = language === 'hi';
    const [expandedChapters, setExpandedChapters] = useState({});
    const [progress, setProgress] = useState(null);
    const [bookData, setBookData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [isAdActionActive, setIsAdActionActive] = useState(false);
    const { showLoading, hideLoading } = useLoading();

    // Interstitial Ad Setup
    const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
    });

    // Handle Ad Completion/Close
    useEffect(() => {
        if (isClosed && isAdActionActive) {
            setIsAdActionActive(false);
            hideLoading();
            navigation.goBack();
        }
    }, [isClosed]);

    // Show ad when loaded
    useEffect(() => {
        if (isLoaded && isAdActionActive) {
            show();
        }
    }, [isLoaded]);

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            setShowSupportModal(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    const handleExitWithAd = () => {
        setShowSupportModal(false);
        setIsAdActionActive(true);
        showLoading(isHindi ? 'दिव्य विज्ञापन तैयार हो रहा है...' : 'Preparing ad...');
        load();
    };

    const handleExitDirectly = () => {
        setShowSupportModal(false);
        navigation.goBack();
    };

    // Ad Rotation Logic
    const BANNER_AD_IDS = [
        TestIds.BANNER,
        'ca-app-pub-3940256099942544/6300978111'
    ];
    const [adIndex, setAdIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAdIndex((prev) => (prev + 1) % BANNER_AD_IDS.length);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch Progress
            const progressData = await loadSlokaProgress();
            setProgress(progressData);

            // Fetch Book Structure from API
            const response = await fetch(`https://api.thevibecoderagency.online/api/srikrishna-aarti/granth/${book.id}`);
            const data = await response.json();
            setBookData(data);
        } catch (error) {
            console.error('Fetch Book Structure error:', error);
            // Fallback to route param if API fails
            setBookData(book);
        } finally {
            setIsLoading(false);
        }
    }, [book.id]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const toggleChapter = (chapterId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // Allow expansion even if locked to show locked verses
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const renderVerse = (verse, chapterId) => {
        const isLocked = progress && !progress.unlockedVerses?.includes(verse.id);
        const isCompleted = progress && progress.completedVerses?.includes(verse.id);

        return (
            <TouchableOpacity
                key={verse.id}
                style={[styles.verseItem, isLocked && styles.lockedVerse]}
                onPress={() => !isLocked && navigation.navigate('SlokaStudy', {
                    verseId: verse.id,
                    bookId: book.id,
                    bookStructure: bookData // Pass structure for next verse calculation
                })}
            >
                <View style={styles.verseInfo}>
                    <Text style={styles.verseIndicator}>
                        {isHindi ? `श्लोक ${verse.index}` : `Verse ${verse.index}`}
                    </Text>
                    {isLocked && <Ionicons name="lock-closed" size={14} color="#BCAAA4" />}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFD700" />
            </TouchableOpacity>
        );
    };

    const renderChapter = ({ item }) => {
        const isExpanded = expandedChapters[item.id];
        const title = isHindi ? item.titleHi : item.title;

        return (
            <View style={styles.chapterCard}>
                <TouchableOpacity
                    style={styles.chapterHeader}
                    onPress={() => toggleChapter(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.chapterTitleContainer}>
                        <Text style={styles.chapterIndex}>
                            {isHindi ? `अध्याय ${item.index}` : `Chapter ${item.index}`}
                        </Text>
                        <Text style={styles.chapterName}>{title}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#FFD700"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.verseList}>
                        {item.verses.length > 0 ? (
                            item.verses.map(v => renderVerse(v, item.id))
                        ) : (
                            <Text style={styles.comingSoon}>
                                {isHindi ? 'जल्द आ रहा है...' : 'Coming Soon...'}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowSupportModal(true)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>
                        {isHindi ? book.titleHi : book.title}
                    </Text>
                    <Text style={styles.headerTitle}>
                        {isHindi ? 'अध्याय एवं श्लोक' : 'Chapters & Verses'}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Banner Ad placement (below header) */}
            <View style={styles.adContainer}>
                <BannerAd
                    key={`ad-chapters-${adIndex}`}
                    unitId={BANNER_AD_IDS[adIndex]}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>
                        {isHindi ? 'अध्याय लोड हो रहे हैं...' : 'Loading Chapters...'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookData?.chapters || []}
                    keyExtractor={item => item.id}
                    renderItem={renderChapter}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Exit Support Modal */}
            <Modal
                transparent={true}
                visible={showSupportModal}
                animationType="fade"
                onRequestClose={() => setShowSupportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.devotionalCard}>
                        <View style={styles.spiritualIconBox}>
                            <Ionicons name="heart-circle" size={60} color="#FFD700" />
                        </View>

                        <Text style={styles.modalTitle}>
                            {isHindi ? 'शुभ विदाई' : 'Sacred Farewell'}
                        </Text>

                        <Text style={styles.devotionalText}>
                            {isHindi
                                ? 'प्रिय भक्त, यदि आपको गीता पढ़ना और हमारा कार्य पसंद आ रहा है, तो कृपया एक विज्ञापन देखकर हमारा सहयोग करें।'
                                : 'Dear Devotee, if you like our work or reading the Gita, please support us by watching a short ad.'}
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.supportBtn}
                                onPress={handleExitWithAd}
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFA000']}
                                    style={styles.btnGradient}
                                >
                                    <Ionicons name="videocam" size={20} color="#000" />
                                    <Text style={styles.supportBtnText}>
                                        {isHindi ? 'सहयोग करें' : 'Support'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={handleExitDirectly}
                            >
                                <Text style={styles.cancelBtnText}>
                                    {isHindi ? 'वापस जाएं' : 'Back'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#120E0A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15
    },
    loadingText: {
        color: '#FFD700',
        fontSize: 16,
        fontFamily: 'serif'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3E2723',
        backgroundColor: '#1A120B'
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#120E0A',
        borderBottomWidth: 1,
        borderBottomColor: '#3E2723',
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        alignItems: 'center'
    },
    headerSubtitle: {
        color: '#B0BEC5',
        fontSize: 12,
        textTransform: 'uppercase'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    listContent: {
        padding: 20
    },
    chapterCard: {
        backgroundColor: '#2C1B10',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#5D4037',
        overflow: 'hidden'
    },
    chapterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#1A120B'
    },
    chapterTitleContainer: {
        flex: 1
    },
    chapterIndex: {
        color: '#BCAAA4',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2
    },
    chapterName: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'serif'
    },
    verseList: {
        padding: 10,
        backgroundColor: '#2C1B10'
    },
    verseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    verseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    verseIndicator: {
        color: '#EFEBE9',
        fontSize: 14,
    },
    lockedVerse: {
        opacity: 0.5
    },
    comingSoon: {
        color: '#BCAAA4',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10
    },
    // Modal Enhancements
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    devotionalCard: {
        backgroundColor: '#1A120B',
        width: '90%',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    spiritualIconBox: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15,
        fontFamily: 'serif'
    },
    devotionalText: {
        color: '#EFEBE9',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    modalButtonRow: {
        width: '100%',
        gap: 12
    },
    supportBtn: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    supportBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelBtn: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cancelBtnText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SlokaChapterListScreen;

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { GRANTH_LIBRARY_DATA } from '../data/SlokaLibraryData';
import { loadSlokaProgress, resetSlokaProgress } from '../utils/sloka_helpers';

const { width } = Dimensions.get('window');

const SlokaLibraryScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const isHindi = language === 'hi';
    const [progress, setProgress] = useState(null);
    const [granthList, setGranthList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEntranceModal, setShowEntranceModal] = useState(false);
    const [pendingBook, setPendingBook] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch Progress
            const progressData = await loadSlokaProgress();
            setProgress(progressData);

            // Fetch Granth List from API
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/granth');
            const data = await response.json();

            // Enrich the list with chapter data to calculate progress
            const enrichedData = await Promise.all(
                data.map(async (book) => {
                    try {
                        const detailRes = await fetch(`https://api.thevibecoderagency.online/api/srikrishna-aarti/granth/${book.id}`);
                        const detailData = await detailRes.json();
                        return { ...book, ...detailData };
                    } catch (e) {
                        return book;
                    }
                })
            );

            setGranthList(enrichedData);
        } catch (error) {
            console.error('Fetch Granth List error:', error);
            // Fallback to local data if API fails for some reason
            setGranthList(GRANTH_LIBRARY_DATA);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleReset = () => {
        Alert.alert(
            isHindi ? 'प्रगति रीसेट करें?' : 'Reset Progress?',
            isHindi
                ? 'क्या आप अपनी सभी अध्ययन प्रगति को मिटाना चाहते हैं? इसे वापस नहीं लिया जा सकता।'
                : 'Do you want to clear all your study progress? This cannot be undone.',
            [
                { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
                {
                    text: isHindi ? 'हाँ, रीसेट करें' : 'Yes, Reset',
                    style: 'destructive',
                    onPress: async () => {
                        const newProgress = await resetSlokaProgress();
                        setProgress(newProgress);
                        Alert.alert(isHindi ? 'सफल' : 'Success', isHindi ? 'प्रगति रीसेट कर दी गई है।' : 'Progress has been reset.');
                    }
                }
            ]
        );
    };

    const getCompletionStats = (book) => {
        if (!progress || !book.chapters) return { percentage: 0, completed: 0, total: 0 };

        let totalVerses = 0;
        let completedCount = 0;

        book.chapters.forEach(chapter => {
            chapter.verses.forEach(verse => {
                totalVerses++;
                if (progress.completedVerses.includes(verse.id)) {
                    completedCount++;
                }
            });
        });

        const percentage = totalVerses > 0 ? Math.round((completedCount / totalVerses) * 100) : 0;
        return { percentage, completed: completedCount, total: totalVerses };
    };

    const renderBook = ({ item }) => {
        const title = isHindi ? item.titleHi : item.title;
        const desc = isHindi ? item.descriptionHi : item.description;

        // A book is locked if it's explicitly locked in data AND not in progress.unlockedBooks
        const isLocked = item.locked && progress && !progress.unlockedBooks?.includes(item.id);

        const { percentage, completed, total } = getCompletionStats(item);

        return (
            <TouchableOpacity
                style={[styles.bookCard, isLocked && styles.lockedCard]}
                onPress={() => {
                    if (!isLocked) {
                        setPendingBook(item);
                        setShowEntranceModal(true);
                    }
                }}
                activeOpacity={0.8}
            >
                <View style={[styles.imageContainer, isLocked && { opacity: 0.5 }]}>
                    <Image
                        source={item.image_url ? { uri: item.image_url } : item.image}
                        style={styles.bookImage}
                        resizeMode="cover"
                    />
                    {isLocked && (
                        <View style={styles.lockOverlay}>
                            <Ionicons name="lock-closed" size={32} color="#FFD700" />
                        </View>
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.bookTitle}>{title}</Text>
                    <Text style={styles.bookDesc} numberOfLines={2}>{desc}</Text>

                    {!isLocked && (
                        <View style={styles.progressRow}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{percentage}% Complete</Text>
                        </View>
                    )}

                    {isLocked && (
                        <Text style={styles.lockedText}>
                            {isHindi ? 'पिछली पुस्तक पूरी करें' : 'Complete previous book'}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isHindi ? 'ग्रन्थ पुस्तकालय' : 'Granth Library'}
                </Text>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                    <Ionicons name="refresh-circle" size={28} color="#D35400" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>
                        {isHindi ? 'पुस्तकालय लोड हो रहा है...' : 'Loading Granth Library...'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={granthList}
                    keyExtractor={item => item.id}
                    renderItem={renderBook}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={() => (
                        <View style={styles.heroSection}>
                            <Text style={styles.heroTitle}>
                                {isHindi ? 'आध्यात्मिक यात्रा' : 'Spiritual Journey'}
                            </Text>
                            <Text style={styles.heroSubtitle}>
                                {isHindi
                                    ? 'ईश्वर के वचनों को गहराई से समझें और अपने जीवन में उतारें।'
                                    : 'Deeply understand God\'s words and apply them to your life.'}
                            </Text>
                        </View>
                    )}
                />
            )}

            {/* Devotional Entrance Modal */}
            <Modal
                transparent={true}
                visible={showEntranceModal}
                animationType="fade"
                onRequestClose={() => setShowEntranceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.devotionalCard}>
                        <View style={styles.spiritualIconBox}>
                            <Ionicons name="sunny-outline" size={50} color="#FFD700" />
                            <Ionicons name="sparkles" size={24} color="#FFA000" style={styles.topSparkle} />
                        </View>

                        <Text style={styles.modalTitle}>
                            {isHindi ? 'पवित्र शुरुआत' : 'Sacred Beginning'}
                        </Text>

                        <Text style={styles.devotionalText}>
                            {isHindi
                                ? 'प्रिय भक्त, कृपया पूरे हृदय और श्रद्धा के साथ इन पवित्र ग्रंथों का अध्ययन करें। स्वयं पर विश्वास रखें, यह ज्ञान आपके जीवन को नई दिशा देगा।'
                                : 'Dear Devotee, please study these sacred scriptures with a full heart and faith. Believe in yourself; this wisdom will guide your life.'}
                        </Text>

                        <View style={styles.rewardHighlight}>
                            <View style={styles.coinBadge}>
                                <Text style={styles.coinSymbol}>$</Text>
                            </View>
                            <Text style={styles.rewardInfoText}>
                                {isHindi
                                    ? 'प्रत्येक श्लोक पर 5 दिव्य सिक्के प्राप्त करें'
                                    : 'Earn 5 Divya Coins for each verse'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.entranceBtn}
                            onPress={() => {
                                setShowEntranceModal(false);
                                if (pendingBook) {
                                    navigation.navigate('SlokaChapterList', { book: pendingBook });
                                }
                            }}
                        >
                            <Text style={styles.entranceBtnText}>
                                {isHindi ? 'प्रणाम / शुरू करें' : 'Pranam / Start'}
                            </Text>
                        </TouchableOpacity>
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
    // Modal Styles
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
        elevation: 20,
        shadowColor: '#FFD700',
        shadowOpacity: 0.3,
        shadowRadius: 15
    },
    spiritualIconBox: {
        marginBottom: 20,
        position: 'relative'
    },
    topSparkle: {
        position: 'absolute',
        top: -5,
        right: -10
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15,
        fontFamily: 'serif'
    },
    devotionalText: {
        color: '#EFEBE9',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 25,
        fontStyle: 'italic'
    },
    rewardHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 30,
        gap: 12
    },
    coinBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center'
    },
    coinSymbol: {
        color: '#1A120B',
        fontWeight: 'bold',
        fontSize: 14
    },
    rewardInfoText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold'
    },
    entranceBtn: {
        backgroundColor: '#D35400',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }
    },
    entranceBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase'
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
    backButton: {
        padding: 8,
    },
    resetButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    listContent: {
        padding: 20,
        paddingBottom: 40
    },
    heroSection: {
        marginBottom: 30,
        alignItems: 'center'
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D35400',
        marginBottom: 10,
        fontFamily: 'serif'
    },
    heroSubtitle: {
        color: '#B0BEC5',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20
    },
    bookCard: {
        backgroundColor: '#2C1B10',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#5D4037',
        elevation: 5
    },
    lockedCard: {
        opacity: 0.8,
        backgroundColor: '#1A120B'
    },
    imageContainer: {
        width: '100%',
        height: 160,
    },
    bookImage: {
        width: '100%',
        height: '100%'
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        padding: 15
    },
    bookTitle: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'serif'
    },
    bookDesc: {
        color: '#EFEBE9',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 15
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#1A120B',
        borderRadius: 3,
        marginRight: 15
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 3
    },
    progressText: {
        color: '#FFB74D',
        fontSize: 12,
        fontWeight: 'bold'
    },
    lockedText: {
        color: '#BCAAA4',
        fontSize: 12,
        fontStyle: 'italic'
    }
});

export default SlokaLibraryScreen;

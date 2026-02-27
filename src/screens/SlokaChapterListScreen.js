import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
    }
});

export default SlokaChapterListScreen;

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    LayoutAnimation,
    Platform,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- Dummy Data ---
// Initial fallback data (keeping first 2 for safety)
const FALLBACK_DATA = [
    {
        id: '1',
        chapter: 'Chapter 2, Verse 47',
        sans: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
        en: {
            text: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
            meaning: "Focus on your work, not the results."
        },
        hi: {
            text: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में नहीं।",
            meaning: "अपने कर्म पर ध्यान दो, परिणाम पर नहीं।"
        }
    }
];

const TRANSLATIONS = {
    en: {
        title: 'Daily Slokas',
        todaysMessage: "Today's Message",
        allSlokas: 'All Slokas',
        tapToReveal: 'Tap to reveal meaning',
        randomize: 'New Message',
        copied: 'Sloka copied to clipboard!',
        shareMsg: 'Check out this beautiful Sloka from Sri Krishna Puja app:\n\n',
    },
    hi: {
        title: 'दैनिक श्लोक',
        todaysMessage: 'आज का संदेश',
        allSlokas: 'सभी श्लोक',
        tapToReveal: 'अर्थ देखने के लिए टैप करें',
        randomize: 'नया संदेश',
        copied: 'श्लोक कॉपी किया गया!',
        shareMsg: 'श्री कृष्ण वॉलपेपर ऐप से यह सुंदर श्लोक देखें:\n\n',
    }
};

const SlokaCard = ({ item, isHindi, t, isFeatured = false }) => {
    const [expanded, setExpanded] = useState(isFeatured); // Featured auto-expanded
    const [isSpeaking, setIsSpeaking] = useState(false);

    const content = isHindi ? item.hi : item.en;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleSpeak = async () => {
        const thingToSay = item.sans;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);

            // Try to find a male voice if available on the device
            const voices = await Speech.getAvailableVoicesAsync();
            const hindiMaleVoice = voices.find(v =>
                (v.language.startsWith('hi') || v.language.startsWith('in')) &&
                (v.name.toLowerCase().includes('male') || v.quality === 'Enhanced')
            );

            Speech.speak(thingToSay, {
                language: 'hi-IN',
                voice: hindiMaleVoice?.identifier, // Use male voice if found
                rate: 0.75, // Slightly slower for more impact
                pitch: 0.85, // Lower pitch for a deeper male sound
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        }
    };

    const handleCopy = async () => {
        const textToCopy = `${item.chapter}\n\n${item.sans}\n\n${content.text}\n\n${content.meaning}`;
        await Clipboard.setStringAsync(textToCopy);
        Alert.alert(isHindi ? 'सफल' : 'Success', t.copied);
    };

    const handleShare = async () => {
        const textToShare = `${t.shareMsg}${item.chapter}\n\n${item.sans}\n\n${content.text}\n\nMeaning: ${content.meaning}`;
        try {
            await Share.share({
                message: textToShare,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, isFeatured && styles.featuredCard]}
            onPress={toggleExpand}
            activeOpacity={0.9}
        >
            {/* Header: Chapter & Menu */}
            <View style={styles.cardHeader}>
                <Text style={[styles.chapterText, isFeatured && { color: '#FFE0B2' }]}>
                    {item.chapter}
                </Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={isFeatured ? "#FFD700" : "#FFB74D"}
                />
            </View>

            {/* Sanskrit Text (Always Visible) */}
            <Text style={[styles.sanskritText, isFeatured && { fontSize: 22 }]}>
                {item.sans}
            </Text>

            {/* Expanded Content: Translation & Tools */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <Text style={[styles.translationText, isFeatured && { color: '#FFF' }]}>
                        {content.text}
                    </Text>
                    <Text style={styles.meaningText}>💡 {content.meaning}</Text>

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleSpeak}>
                            <Ionicons name={isSpeaking ? "stop-circle" : "play-circle"} size={26} color="#FFD700" />
                            <Text style={styles.actionText}>{isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Listen')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                            <Ionicons name="copy-outline" size={22} color="#B0BEC5" />
                            <Text style={styles.actionText}>{isHindi ? 'कॉपी' : 'Copy'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={22} color="#B0BEC5" />
                            <Text style={styles.actionText}>{isHindi ? 'साझा' : 'Share'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!expanded && (
                <Text style={styles.tapHint}>{t.tapToReveal}</Text>
            )}
        </TouchableOpacity>
    );
};

const SlokasScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    // State for Dynamic Data
    const [slokas, setSlokas] = useState([]);
    const [todaysSloka, setTodaysSloka] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRandomizing, setIsRandomizing] = useState(false);

    useEffect(() => {
        fetchSlokas();
    }, []);

    const fetchSlokas = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/daily-slokas');
            const result = await response.json();

            if (result.success && result.data) {
                setSlokas(result.data.allSlokas || []);
                setTodaysSloka(result.data.featuredSloka || result.data.allSlokas[0]);
            } else {
                throw new Error('Failed to fetch slokas');
            }
        } catch (e) {
            console.error('Sloka fetch error:', e);
            setError(isHindi ? 'डेटा लोड करने में विफल' : 'Failed to load slokas');
            // Use fallback data
            setSlokas(FALLBACK_DATA);
            setTodaysSloka(FALLBACK_DATA[0]);
        } finally {
            setLoading(false);
        }
    };

    const randomizeSloka = () => {
        if (slokas.length === 0) return;
        setIsRandomizing(true);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * slokas.length);
            setTodaysSloka(slokas[randomIndex]);
            setIsRandomizing(false);
        }, 500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color="#D35400" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchSlokas}>
                        <Text style={styles.retryBtnText}>{isHindi ? 'पुनः प्रयास करें' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={slokas}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <SlokaCard item={item} isHindi={isHindi} t={t} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={() => (
                        <View style={styles.featuredContainer}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>{t.todaysMessage}</Text>
                                <TouchableOpacity onPress={randomizeSloka} style={styles.randomBtn}>
                                    {isRandomizing ? (
                                        <ActivityIndicator size="small" color="#FFD700" />
                                    ) : (
                                        <Ionicons name="shuffle" size={20} color="#FFD700" />
                                    )}
                                    <Text style={styles.randomBtnText}>{t.randomize}</Text>
                                </TouchableOpacity>
                            </View>

                            {todaysSloka && (
                                <SlokaCard
                                    item={todaysSloka}
                                    isHindi={isHindi}
                                    t={t}
                                    isFeatured={true}
                                />
                            )}

                            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t.allSlokas}</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#120E0A', // Very dark brown/black
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700', // Gold
        fontFamily: 'serif'
    },
    listContent: {
        padding: 20,
        paddingBottom: 80
    },
    featuredContainer: {
        marginBottom: 10
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D35400', // Burnt Orange
        marginLeft: 4
    },
    randomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3E2723',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    randomBtnText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5
    },
    card: {
        backgroundColor: '#2C1B10', // Dark Wood
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#5D4037',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden', // Contain expanded content
    },
    featuredCard: {
        backgroundColor: '#BF360C', // Deep Saffron for Featured
        borderColor: '#FFD700',
        borderWidth: 1.5
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    chapterText: {
        color: '#FFB74D',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 30, // Better reading spacing
        fontFamily: 'serif'
    },
    expandedContent: {
        marginTop: 5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 12
    },
    translationText: {
        color: '#EFEBE9',
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 24,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    meaningText: {
        color: '#B0BEC5', // Greyish blue
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'center'
    },
    tapHint: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 5
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    actionText: {
        color: '#B0BEC5',
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        color: '#D35400',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        fontFamily: 'serif'
    },
    retryBtn: {
        marginTop: 20,
        backgroundColor: '#3E2723',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    retryBtnText: {
        color: '#FFD700',
        fontWeight: 'bold'
    }
});

export default SlokasScreen;

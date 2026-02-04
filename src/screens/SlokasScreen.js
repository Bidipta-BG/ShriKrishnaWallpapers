import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useState } from 'react';
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
const SLOKA_DATA = [
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
    },
    {
        id: '2',
        chapter: 'Chapter 4, Verse 7',
        sans: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
        en: {
            text: "Whenever there is a decline in righteousness and an increase in unrighteousness, O Arjun, at that time I manifest Myself on earth.",
            meaning: "God descends when Dharma needs protection."
        },
        hi: {
            text: "जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप को रचता हूँ अर्थात साकार रूप से लोगों के सम्मुख प्रकट होता हूँ।",
            meaning: "धर्म की रक्षा के लिए भगवान अवतार लेते हैं।"
        }
    },
    {
        id: '3',
        chapter: 'Chapter 9, Verse 22',
        sans: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
        en: {
            text: "To those who are constantly devoted to serving Me with love, I give the understanding by which they can come to Me.",
            meaning: "God takes care of those who rely on Him."
        },
        hi: {
            text: "जो अनन्य भाव से मेरा चिंतन करते हुए मेरी उपासना करते हैं, उनके योग और क्षेम (पालन-पोषण) का वहन मैं स्वयं करता हूँ।",
            meaning: "भगवान अपने भक्तों का ध्यान रखते हैं।"
        }
    },
    {
        id: '4',
        chapter: 'Chapter 18, Verse 66',
        sans: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
        en: {
            text: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
            meaning: "Surrender completely to God."
        },
        hi: {
            text: "सभी धर्मों को त्यागकर तू केवल मेरी शरण में आ जा। मैं तुझे सभी पापों से मुक्त कर दूँगा, तू शोक मत कर।",
            meaning: "ईश्वर शरण में ही सच्ची मुक्ति है।"
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
        shareMsg: 'Check out this beautiful Sloka from Shri Krishna Wallpapers app:\n\n',
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
            Speech.speak(thingToSay, {
                language: 'hi-IN',
                rate: 0.8,
                pitch: 1.0,
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

    // State for Today's Message (Randomizer)
    const [todaysSloka, setTodaysSloka] = useState(SLOKA_DATA[0]);
    const [isRandomizing, setIsRandomizing] = useState(false);

    const randomizeSloka = () => {
        setIsRandomizing(true);
        // Simple shuffle animation effect could be added here
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * SLOKA_DATA.length);
            setTodaysSloka(SLOKA_DATA[randomIndex]);
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

            <FlatList
                data={SLOKA_DATA}
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

                        <SlokaCard
                            item={todaysSloka}
                            isHindi={isHindi}
                            t={t}
                            isFeatured={true}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t.allSlokas}</Text>
                    </View>
                )}
            />
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
    }
});

export default SlokasScreen;

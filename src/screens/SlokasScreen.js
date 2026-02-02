import { Ionicons } from '@expo/vector-icons';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// --- Dummy Data (Simulating Backend) ---
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
        readMore: 'Tap to read meaning',
    },
    hi: {
        title: 'दैनिक श्लोक',
        todaysMessage: 'आज का संदेश',
        allSlokas: 'सभी श्लोक',
        readMore: 'अर्थ पढ़ने के लिए टैप करें',
    }
};

const SlokasScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    // Simulating "Today's Sloka" (e.g., Random or fixed to ID 1)
    const todaysSloka = SLOKA_DATA[0];

    const renderSlokaItem = ({ item }) => {
        const content = isHindi ? item.hi : item.en;
        return (
            <View style={styles.card}>
                <Text style={styles.chapterText}>{item.chapter}</Text>
                <Text style={styles.sanskritText}>{item.sans}</Text>
                <View style={styles.divider} />
                <Text style={styles.translationText}>{content.text}</Text>
                <Text style={styles.meaningText}>💡 {content.meaning}</Text>
            </View>
        );
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
                renderItem={renderSlokaItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.featuredContainer}>
                        <Text style={styles.sectionTitle}>{t.todaysMessage}</Text>
                        <View style={[styles.card, styles.featuredCard]}>
                            <Text style={[styles.chapterText, { color: '#FFE0B2' }]}>{todaysSloka.chapter}</Text>
                            <Text style={[styles.sanskritText, { fontSize: 20 }]}>{todaysSloka.sans}</Text>
                            <Text style={[styles.translationText, { color: '#FFF' }]}>
                                {isHindi ? todaysSloka.hi.text : todaysSloka.en.text}
                            </Text>
                        </View>
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
        paddingBottom: 80 // Increased for potential bottom nav overlap
    },
    featuredContainer: {
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D35400', // Burnt Orange
        marginBottom: 10,
        marginLeft: 4
    },
    card: {
        backgroundColor: '#2C1B10', // Dark Wood
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#5D4037',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    featuredCard: {
        backgroundColor: '#BF360C', // Deep Saffron for Featured
        borderColor: '#FFD700',
        borderWidth: 1.5
    },
    chapterText: {
        color: '#FFB74D',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 28,
        fontFamily: 'serif'
    },
    divider: {
        height: 1,
        backgroundColor: '#5D4037',
        marginVertical: 10
    },
    translationText: {
        color: '#EFEBE9',
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 22,
        fontStyle: 'italic'
    },
    meaningText: {
        color: '#B0BEC5', // Greyish blue for meaning
        fontSize: 14,
        marginTop: 4
    }
});

export default SlokasScreen;

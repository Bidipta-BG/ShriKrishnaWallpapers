import { Ionicons } from '@expo/vector-icons';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

// --- Dummy Data ---
const MANTRA_DATA = [
    {
        id: '1',
        title: 'Om Shri Vardhanaya Namah',
        sans: 'ॐ श्री वर्धनाय नमः',
        benefit: {
            en: 'For success in career and growth.',
            hi: 'करियर में सफलता और वृद्धि के लिए।'
        },
        details: {
            en: "Chanting this mantra 108 times is believed to remove obstacles in your professional life. It invites Lord Krishna's blessings for career growth, financial stability, and success in new ventures.",
            hi: "इस मंत्र का 108 बार जाप करने से व्यावसायिक जीवन में आने वाली बाधाएं दूर होती हैं। यह करियर में वृद्धि, आर्थिक स्थिरता और नए प्रयासों में सफलता के लिए भगवान कृष्ण का आशीर्वाद लाता है।"
        },
        count: 108
    },
    {
        id: '2',
        title: 'Hare Krishna Maha Mantra',
        sans: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम राम राम हरे हरे॥',
        benefit: {
            en: 'For inner peace and spiritual bliss.',
            hi: 'आंतरिक शांति और आध्यात्मिक आनंद के लिए।'
        },
        details: {
            en: "The Maha Mantra cleanses the heart of all accumulated dust/anxiety. Chanting 108 times brings immense peace, reduces stress, and awakens dormant divine love (Prema) for God.",
            hi: "महामंत्र हृदय को सभी जमा हुई धूल/चिंता से शुद्ध करता है। 108 बार जाप करने से असीम शांति मिलती है, तनाव कम होता है और भगवान के लिए सुप्त दिव्य प्रेम (प्रेम) जागृत होता है।"
        },
        count: 108
    },
    {
        id: '3',
        title: 'Om Namo Bhagavate Vasudevaya',
        sans: 'ॐ नमो भगवते वासुदेवाय',
        benefit: {
            en: 'Surrender to Lord Krishna.',
            hi: 'भगवान कृष्ण को समर्पण।'
        },
        details: {
            en: "This mantra means 'I bow to Lord Vasudeva (Krishna)'. Chanting it creates a shield of divine protection and helps one to surrender ego, bringing clarity and wisdom to life decisions.",
            hi: "इस मंत्र का अर्थ है 'मैं भगवान वासुदेव (कृष्ण) को नमन करता हूं'। इसका जाप ईश्वरीय सुरक्षा का कवच बनाता है और अहंकार को त्यागने में मदद करता है, जिससे जीवन के निर्णयों में स्पष्टता और ज्ञान आता है।"
        },
        count: 108
    },
    {
        id: '4',
        title: 'Kleem Krishnaya Namah',
        sans: 'क्लीं कृष्णाय नमः',
        benefit: {
            en: 'Attracts love and positive energy.',
            hi: 'प्रेम और सकारात्मक ऊर्जा को आकर्षित करता है।'
        },
        details: {
            en: "'Kleem' is the seed sound of attraction. Chanting this invokes Krishna's magnetic charm, helping to attract good relationships, true love, and positive spiritual energy into your life.",
            hi: "'क्लीं' आकर्षण का बीज मंत्र है। इसका जाप कृष्ण के चुंबकीय आकर्षण का आह्वान करता है, जो आपके जीवन में अच्छे रिश्ते, सच्चा प्यार और सकारात्मक आध्यात्मिक ऊर्जा को आकर्षित करने में मदद करता है।"
        },
        count: 108
    }
];

const TRANSLATIONS = {
    en: {
        title: 'Select a Mantra',
        startChanting: 'Start Chanting',
        times: 'times'
    },
    hi: {
        title: 'मंत्र चुनें',
        startChanting: 'jaap शुरू करें',
        times: 'बार'
    }
};

const MantraSelectionScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chanting', { mantra: item })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.mantraTitle}>{isHindi ? item.sans : item.title}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{item.count}</Text>
                    </View>
                </View>

                <Text style={styles.sanskritText}>{item.sans}</Text>

                <View style={styles.divider} />

                <Text style={styles.benefitText}>
                    ✨ {isHindi ? item.benefit.hi : item.benefit.en}
                </Text>

                <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>{t.startChanting} →</Text>
                </View>
            </TouchableOpacity>
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
                data={MANTRA_DATA}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#120E0A',
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
        color: '#FFD700',
        fontFamily: 'serif'
    },
    listContent: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#2C1B10',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#5D4037',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10
    },
    mantraTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10
    },
    countBadge: {
        backgroundColor: '#4E342E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#8D6E63'
    },
    countText: {
        color: '#FFCC80',
        fontSize: 12,
        fontWeight: 'bold'
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 22,
        textAlign: 'center',
        marginVertical: 10,
        fontFamily: 'serif',
        lineHeight: 32
    },
    divider: {
        height: 1,
        backgroundColor: '#5D4037',
        marginVertical: 12
    },
    benefitText: {
        color: '#BCAAA4',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 15
    },
    startBtn: {
        backgroundColor: '#E65100', // Deep Orange
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5
    },
    startBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default MantraSelectionScreen;

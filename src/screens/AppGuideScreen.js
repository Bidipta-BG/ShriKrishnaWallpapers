
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const AppGuideScreen = ({ navigation }) => {
    const { language, setGuideSeen, setUIReady } = useLanguage();
    const isHindi = language === 'hi';

    const CONTENT = {
        en: {
            title: 'Welcome to Sri Krishna Puja',
            subtitle: 'Your personal spiritual companion',
            features: [
                {
                    icon: 'flower',
                    title: 'Daily Darshan',
                    desc: 'Perform daily puja rituals including Aarti and Flower shower to receive divine blessings.',
                    color: '#FF9933'
                },
                {
                    icon: 'star',
                    title: 'Nitya Bhakti (Streak)',
                    desc: 'Earn 10 Divya Coins every day you visit! Miss a day, and your progress resets unless protected.',
                    color: '#FFD700'
                },
                {
                    icon: 'images',
                    title: 'Divine Wallpapers',
                    desc: 'A massive collection of beautiful spiritual wallpapers updated daily for your device.',
                    color: '#9c6ce6'
                },
                {
                    icon: 'book',
                    title: 'Bhagavad Gita & Granths',
                    desc: 'Study sacred verses from the Bhagavad Gita and other holy scriptures at your own pace.',
                    color: '#e53935'
                },
                {
                    icon: 'musical-notes',
                    title: 'Mantras & Chanting',
                    desc: 'Listen to powerful Vedic mantras and track your Japa chanting to find inner peace.',
                    color: '#4dabf7'
                },
                {
                    icon: 'cart',
                    title: 'Samagri Store',
                    desc: 'Use your earned Divya Coins to purchase sacred items like Thali, Dhup, and Mala for your puja.',
                    color: '#4caf50'
                },
                {
                    icon: 'heart',
                    title: 'A Gift of Devotion',
                    desc: 'This app is 100% free with no subscriptions. Your support through minimal ads helps us keep this divine service running for everyone.',
                    color: '#e91e63'
                }
            ],
            button: 'Start Your Journey'
        },
        hi: {
            title: 'श्री कृष्ण पूजा में आपका स्वागत है',
            subtitle: 'आपका व्यक्तिगत आध्यात्मिक साथी',
            features: [
                {
                    icon: 'flower',
                    title: 'दैनिक दर्शन',
                    desc: 'दिव्य आशीर्वाद प्राप्त करने के लिए आरती और पुष्प वर्षा सहित दैनिक पूजा अनुष्ठान करें।',
                    color: '#FF9933'
                },
                {
                    icon: 'star',
                    title: 'नित्य भक्ति (स्ट्रेक)',
                    desc: 'हर दिन दर्शन करने पर १० दिव्य मुद्रा अर्जित करें! एक दिन चूकने पर आपकी प्रगति शून्य हो जाएगी।',
                    color: '#FFD700'
                },
                {
                    icon: 'images',
                    title: 'दिव्य वॉलपेपर',
                    desc: 'आपके उपकरण के लिए प्रतिदिन अपडेट किए जाने वाले सुंदर आध्यात्मिक वॉलपेपर का विशाल संग्रह।',
                    color: '#9c6ce6'
                },
                {
                    icon: 'book',
                    title: 'भगवद गीता और ग्रंथ',
                    desc: 'भगवद गीता और अन्य पवित्र शास्त्रों के श्लोकों का अपनी गति से अध्ययन करें।',
                    color: '#e53935'
                },
                {
                    icon: 'musical-notes',
                    title: 'मंत्र और जाप',
                    desc: 'शक्तिशाली वैदिक मंत्रों को सुनें और आंतरिक शांति पाने के लिए अपने जप को ट्रैक करें।',
                    color: '#4dabf7'
                },
                {
                    icon: 'cart',
                    title: 'सामग्री स्टोर',
                    desc: 'अपनी अर्जित दिव्य मुद्राओं का उपयोग पूजा के लिए थाली, धूप और माला जैसी पवित्र वस्तुएं खरीदने के लिए करें।',
                    color: '#4caf50'
                },
                {
                    icon: 'heart',
                    title: 'भक्ति का उपहार',
                    desc: 'यह ऐप बिना किसी शुल्क के १००% मुफ्त है। विज्ञापनों के माध्यम से आपका सहयोग हमें इस दिव्य सेवा को सभी के लिए जारी रखने में मदद करता है।',
                    color: '#e91e63'
                }
            ],
            button: 'अपनी यात्रा शुरू करें'
        }
    };

    const t = CONTENT[language] || CONTENT.en;

    const handleStart = async () => {
        await setGuideSeen(true);
        setUIReady(true);
        navigation.replace('DailyDarshan');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#1a0f00', '#2d1b00', '#000']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.ornamentContainer}>
                            <View style={styles.line} />
                            <Ionicons name="sunny" size={24} color="#FFD700" />
                            <View style={styles.line} />
                        </View>
                        <Text style={styles.title}>{t.title}</Text>
                        <Text style={styles.subtitle}>{t.subtitle}</Text>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresContainer}>
                        {t.features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <View style={[styles.iconBox, { backgroundColor: feature.color + '20', borderColor: feature.color }]}>
                                    <Ionicons name={feature.icon} size={30} color={feature.color} />
                                </View>
                                <View style={styles.featureInfo}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#FFD700', '#B8860B']}
                                style={styles.gradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>{t.button}</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 10 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={styles.footerText}>Radhe Radhe 🙏</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    ornamentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    line: {
        width: 60,
        height: 1,
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        fontFamily: 'serif',
    },
    subtitle: {
        fontSize: 16,
        color: '#BCAAA4',
        textAlign: 'center',
        marginTop: 5,
        opacity: 0.8,
    },
    featuresContainer: {
        gap: 20,
        marginBottom: 40,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginRight: 20,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
    },
    startButton: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#FFD700',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    gradientButton: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerText: {
        color: '#BCAAA4',
        fontSize: 14,
        fontStyle: 'italic',
        opacity: 0.6,
    },
});

export default AppGuideScreen;

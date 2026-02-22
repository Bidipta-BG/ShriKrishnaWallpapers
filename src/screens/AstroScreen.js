import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const ASTRO_MENU_ITEMS = [
    { id: '1', name: 'Hand Analysis', icon: 'hand-left-outline', color: '#FFD700' },
    { id: '2', name: 'Daily report', icon: 'document-text-outline', color: '#4dabf7' },
    { id: '3', name: 'Tarot', icon: 'albums-outline', color: '#9c6ce6' },
    { id: '4', name: 'Horoscope', icon: 'planet-outline', color: '#ff6b6b' },
    { id: '5', name: 'Love Test', icon: 'heart-outline', color: '#f06595' },
];

const TRANSLATIONS = {
    en: {
        title: 'Divine Astro',
        comingSoon: 'COMING SOON',
        surveyTitle: 'A Message for You 🙏',
        surveyMsg: 'Jai Sri Krishna! We are working really hard to bring the best personalized astrology features for you. Since we want to provide this completely free, we want to know if you really want this feature to be here.',
        surveyQuestion: 'Would you like us to launch this feature?',
        yes: 'Yes, I need it! ✨',
        no: 'Not for me 🚫',
        thankYouTitle: 'Jai Sri Krishna! 🙏',
        thankYouMsg: 'Thank you for your valuable feedback. We are working hard to make this app best for you!',
        // Legacy below
        onboardingTitle: 'Complete Your Profile',
        genderTitle: 'Select Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        dobTitle: 'Date of Birth',
        tobTitle: 'Time of Birth',
        accuracyNote: 'As much accurate you provide this info the result will be more matching',
        tcTitle: 'Terms & Conditions',
        tcText: 'This Astro service is provided for spiritual guidance and entertainment purposes only. We do not guarantee the accuracy of any predictions or analysis. By using this feature, you agree that you are responsible for any decisions made based on this information. We are not legally liable for any outcomes resulting from the use of this service. Predictions are based on spiritual algorithms and historical wisdom, which may vary in interpretation.',
        accept: 'Accept & Continue',
        readTC: 'Read Terms & Conditions',
        hideTC: 'Hide Terms & Conditions',
    },
    hi: {
        title: 'दिव्य ज्योतिष',
        comingSoon: 'शीघ्र आ रहा है',
        surveyTitle: 'आपके लिए एक संदेश 🙏',
        surveyMsg: 'जय श्री कृष्णा! हम आपके लिए सर्वोत्तम व्यक्तिगत ज्योतिष सुविधाएं लाने के लिए बहुत कड़ी मेहनत कर रहे हैं। चूंकि हम इसे पूरी तरह से निःशुल्क प्रदान करना चाहते हैं, हम यह जानना चाहते हैं कि क्या आप वाकई चाहते हैं कि यह सुविधा यहां हो।',
        surveyQuestion: 'क्या आप चाहते हैं कि हम यह सुविधा लॉन्च करें?',
        yes: 'हाँ, मुझे इसकी आवश्यकता है! ✨',
        no: 'मेरे लिए नहीं 🚫',
        thankYouTitle: 'जय श्री कृष्णा! 🙏',
        thankYouMsg: 'आपकी बहुमूल्य प्रतिक्रिया के लिए धन्यवाद। हम इस ऐप को आपके लिए सर्वोत्तम बनाने के लिए कड़ी मेहनत कर रहे हैं!',
        // Legacy below
        onboardingTitle: 'अपनी प्रोफाइल पूरी करें',
        genderTitle: 'लिंग चुनें',
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        dobTitle: 'जन्म तिथि',
        tobTitle: 'जन्म समय',
        accuracyNote: 'आप यह जानकारी जितनी सटीक देंगे, परिणाम उतने ही बेहतर होंगे।',
        tcTitle: 'नियम एवं शर्तें',
        tcText: 'यह ज्योतिष सेवा केवल आध्यात्मिक मार्गदर्शन और मनोरंजन के उद्देश्य से प्रदान की जाती है। हम किसी भी भविष्यवाणी या विश्लेषण की सटीकता की गारंटी नहीं देते हैं। इस सुविधा का उपयोग करके, आप सहमत हैं कि इस जानकारी के आधार पर लिए गए किसी भी निर्णय के लिए आप जिम्मेदार हैं। हम इस सेवा के उपयोग से उत्पन्न होने वाले किसी भी परिणाम के लिए कानूनी रूप से उत्तरदायी नहीं हैं। भविष्यवाणियां आध्यात्मिक एल्गोरिदम और ऐतिहासिक ज्ञान पर आधारित हैं, जिनकी व्याख्या भिन्न हो सकती है।',
        accept: 'स्वीकार करें और जारी रखें',
        readTC: 'नियम एवं शर्तें पढ़ें',
        hideTC: 'नियम एवं शर्तें छिपाएं',
    }
};

const AstroScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    const [hasVoted, setHasVoted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Legacy States (Kept for future) ---
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [gender, setGender] = useState(null);
    const [dob, setDob] = useState(new Date());
    const [tob, setTob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showTC, setShowTC] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const vote = await AsyncStorage.getItem('astro_survey_recorded');
            if (vote === 'true') {
                setHasVoted(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getOrGenerateDeviceId = async () => {
        try {
            let deviceId = await AsyncStorage.getItem('astro_device_id');
            if (!deviceId) {
                deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await AsyncStorage.setItem('astro_device_id', deviceId);
            }
            return deviceId;
        } catch (e) {
            return 'anonymous_device';
        }
    };

    const recordInterest = async (isInterested) => {
        setIsSubmitting(true);
        try {
            const deviceId = await getOrGenerateDeviceId();

            // API call to record interest
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/astro-interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interested: isInterested,
                    language: language,
                    timestamp: new Date().toISOString(),
                    deviceId: deviceId
                })
            });

            const result = await response.json();

            if (result.success) {
                // Save locally to show thank you and prevent duplicate voting
                await AsyncStorage.setItem('astro_survey_recorded', 'true');
                setHasVoted(true);
            } else {
                console.error('API responded with failure:', result.message);
                // Still allow user to see thank you as we'll try again or just let them be
                await AsyncStorage.setItem('astro_survey_recorded', 'true');
                setHasVoted(true);
            }
        } catch (e) {
            console.error('Error recording interest:', e);
            // In case of error (networking), still show thank you locally
            await AsyncStorage.setItem('astro_survey_recorded', 'true');
            setHasVoted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Legacy Handlers ---
    const handleOnboardingSubmit = async () => {
        // ... kept in code ...
    };

    if (isLoading) return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#FFD700" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!hasVoted ? (
                    <View style={styles.surveyContainer}>
                        <LinearGradient
                            colors={['#1a1a2a', '#0a0a0a']}
                            style={styles.surveyCard}
                        >
                            <View style={styles.surveyIconWrapper}>
                                <Ionicons name="planet" size={60} color="#FFD700" />
                                <View style={styles.glowDot} />
                            </View>

                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>{t.comingSoon}</Text>
                            </View>

                            <Text style={styles.surveyTitle}>{t.surveyTitle}</Text>
                            <Text style={styles.surveyMsg}>{t.surveyMsg}</Text>

                            <View style={styles.divider} />

                            <Text style={styles.surveyQuestion}>{t.surveyQuestion}</Text>

                            <View style={styles.btnRow}>
                                <TouchableOpacity
                                    style={[styles.surveyBtn, styles.yesBtn]}
                                    onPress={() => recordInterest(true)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.yesBtnText}>{t.yes}</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.surveyBtn, styles.noBtn]}
                                    onPress={() => recordInterest(false)}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.noBtnText}>{t.no}</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                ) : (
                    <View style={styles.thankYouContainer}>
                        <LinearGradient
                            colors={['#0a0a0a', '#1a1a2a']}
                            style={styles.surveyCard}
                        >
                            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                            <Text style={styles.thankYouTitle}>{t.thankYouTitle}</Text>
                            <Text style={styles.thankYouMsg}>{t.thankYouMsg}</Text>

                            <TouchableOpacity
                                style={[styles.surveyBtn, styles.yesBtn, { marginTop: 30 }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.yesBtnText}>Back to Puja</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}
            </ScrollView>

            <BottomNav navigation={navigation} activeTab="Astro" />

            {/* Legacy UI - Kept in code for future use, but currently hidden */}
            {false && (
                <>
                    <FlatList
                        data={ASTRO_MENU_ITEMS}
                        keyExtractor={(item) => item.id}
                        renderItem={() => null}
                        numColumns={2}
                        contentContainerStyle={styles.gridContainer}
                    />
                    <Modal visible={false} />
                </>
            )}
        </SafeAreaView>
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
        paddingVertical: 15,
        backgroundColor: '#0a0a0a',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 100,
    },
    surveyContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    surveyCard: {
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        elevation: 10,
    },
    surveyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    comingSoonBadge: {
        backgroundColor: '#FFD70020',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFD70040',
        marginBottom: 15,
    },
    comingSoonText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    glowDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFD700',
        bottom: 25,
        right: 25,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    surveyTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    surveyMsg: {
        color: '#AAA',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 25,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#333',
        marginBottom: 25,
    },
    surveyQuestion: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    surveyBtn: {
        flex: 1,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yesBtn: {
        backgroundColor: '#FFD700',
    },
    noBtn: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
    },
    yesBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    noBtnText: {
        color: '#666',
        fontWeight: '500',
        fontSize: 14,
    },
    thankYouContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    thankYouTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
    },
    thankYouMsg: {
        color: '#AAA',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    }
});

export default AstroScreen;

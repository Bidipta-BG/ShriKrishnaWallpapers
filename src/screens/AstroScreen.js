import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
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
        handAnalysis: 'Hand Analysis',
        dailyReport: 'Daily Report',
        tarot: 'Tarot',
        horoscope: 'Horoscope',
        loveTest: 'Love Test',
    },
    hi: {
        title: 'दिव्य ज्योतिष',
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
        handAnalysis: 'हस्तरेखा विश्लेषण',
        dailyReport: 'दैनिक रिपोर्ट',
        tarot: 'टैरो कार्ड',
        horoscope: 'राशिफल',
        loveTest: 'प्रेम परीक्षण',
    }
};

const AstroScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [gender, setGender] = useState(null);
    const [dob, setDob] = useState(new Date());
    const [tob, setTob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showTC, setShowTC] = useState(false); // Collapsible T&C state

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('astro_profile_completed');
            if (status !== 'true') {
                setIsFirstVisit(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnboardingSubmit = async () => {
        if (!gender) {
            alert(language === 'hi' ? 'कृपया लिंग चुनें' : 'Please select gender');
            return;
        }
        try {
            await AsyncStorage.setItem('astro_profile_completed', 'true');
            await AsyncStorage.setItem('astro_gender', gender);
            await AsyncStorage.setItem('astro_dob', dob.toISOString());
            await AsyncStorage.setItem('astro_tob', tob.toISOString());
            setIsFirstVisit(false);
        } catch (e) {
            console.error(e);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDob(selectedDate);
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) setTob(selectedTime);
    };

    const renderMenuItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() => {
                if (item.id === '1') {
                    navigation.navigate('HandAnalysis');
                } else {
                    console.log('Opening', item.name);
                }
            }}
        >
            <LinearGradient
                colors={['#1a1a1a', '#0a0a0a']}
                style={styles.cardGradient}
            >
                <View style={[styles.iconBox, { borderColor: item.color + '40' }]}>
                    <Ionicons name={item.icon} size={32} color={item.color} />
                </View>
                <Text style={styles.cardText}>{language === 'hi' ? t[item.id] || item.name : item.name}</Text>

                {/* Visual Flair */}
                <View style={[styles.cardDot, { backgroundColor: item.color }]} />
            </LinearGradient>
        </TouchableOpacity>
    );

    if (isLoading) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={async () => {
                    await AsyncStorage.removeItem('astro_profile_completed');
                    setIsFirstVisit(true);
                }}>
                    <Ionicons name="person-circle-outline" size={28} color="#FFD700" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={ASTRO_MENU_ITEMS}
                keyExtractor={(item) => item.id}
                renderItem={renderMenuItem}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                ListHeaderComponent={
                    <View style={styles.welcomeBox}>
                        <Text style={styles.welcomeTitle}>Jai Shri Krishna! 🙏</Text>
                        <Text style={styles.welcomeSubtitle}>Discover your cosmic path today.</Text>
                    </View>
                }
            />

            {/* Bottom Navigation */}
            <BottomNav navigation={navigation} activeTab="Astro" />

            {/* Onboarding Popup (Modal) */}
            <Modal
                visible={isFirstVisit}
                transparent={true}
                animationType="slide"
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.onboardingModalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.onboardingHeader}>{t.onboardingTitle}</Text>

                            {/* Gender Selection */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t.genderTitle}</Text>
                                <View style={styles.genderRow}>
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                            onPress={() => setGender(g)}
                                        >
                                            <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                                {language === 'hi' ? (g === 'Male' ? t.male : g === 'Female' ? t.female : t.other) : g}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* DOB / TOB */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t.dobTitle}</Text>
                                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color="#FFD700" />
                                    <Text style={styles.pickerText}>{dob.toDateString()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t.tobTitle}</Text>
                                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                                    <Ionicons name="time-outline" size={20} color="#FFD700" />
                                    <Text style={styles.pickerText}>{tob.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.noteBox}>
                                <Ionicons name="information-circle-outline" size={18} color="#4dabf7" />
                                <Text style={styles.noteText}>{t.accuracyNote}</Text>
                            </View>

                            {/* Terms & Conditions (Collapsible) */}
                            <TouchableOpacity
                                style={styles.tcToggle}
                                onPress={() => setShowTC(!showTC)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.tcToggleText}>{showTC ? t.hideTC : t.readTC}</Text>
                                <Ionicons
                                    name={showTC ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color="#AAA"
                                />
                            </TouchableOpacity>

                            {showTC && (
                                <View style={styles.tcBox}>
                                    <Text style={styles.tcHeader}>{t.tcTitle}</Text>
                                    <Text style={styles.tcText}>{t.tcText}</Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.submitBtn} onPress={handleOnboardingSubmit}>
                                <Text style={styles.submitBtnText}>{t.accept}</Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dob}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={tob}
                                    mode="time"
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    onboardingModalContent: {
        backgroundColor: '#111',
        borderRadius: 25,
        padding: 25,
        width: '100%',
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: '#333',
        elevation: 10,
    },
    onboardingHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 25,
        textAlign: 'center',
        fontFamily: 'serif',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#AAA',
        fontSize: 13,
        marginBottom: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderBtn: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    genderBtnActive: {
        backgroundColor: '#9c6ce6',
        borderColor: '#9c6ce6',
    },
    genderText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    genderTextActive: {
        color: '#FFF',
    },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        gap: 12,
    },
    pickerText: {
        color: '#FFF',
        fontSize: 16,
    },
    noteBox: {
        flexDirection: 'row',
        backgroundColor: '#0a1a2a',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
        gap: 10,
    },
    noteText: {
        color: '#4dabf7',
        fontSize: 12,
        flex: 1,
        fontStyle: 'italic',
    },
    tcToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginBottom: 5,
    },
    tcToggleText: {
        color: '#AAA',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    tcBox: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#222',
    },
    tcHeader: {
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tcText: {
        color: '#888',
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        backgroundColor: '#FFD700',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Grid Styles
    gridContainer: {
        padding: 15,
        paddingBottom: 100, // Space for BottomNav
    },
    welcomeBox: {
        marginBottom: 25,
        paddingHorizontal: 5,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#AAA',
    },
    gridCard: {
        flex: 1,
        height: 150,
        margin: 8,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    cardGradient: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBox: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    cardText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardDot: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.6,
    }
});

export default AstroScreen;

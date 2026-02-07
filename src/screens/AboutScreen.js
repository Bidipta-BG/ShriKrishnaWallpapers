import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    ImageBackground,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const AboutScreen = () => {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const isHindi = language === 'hi';

    const t = {
        title: isHindi ? 'हमारे बारे में' : 'About & Support',
        missionTitle: isHindi ? 'हमारा मिशन' : 'Our Mission',
        missionText: isHindi
            ? 'श्री कृष्ण वॉलपेपर ऐप को भक्ति और शांति को हर घर तक पहुंचाने के लिए बनाया गया है। हम इस ऐप को पूरी तरह से मुफ्त रखने के लिए प्रतिबद्ध हैं।'
            : 'Shri Krishna Wallpapers is built to bring devotion and peace to every home. We are committed to keeping this app free for everyone.',
        sevaText: isHindi
            ? 'इस ऐप को बनाए रखने और विकसित करने में बहुत मेहनत और संसाधनों की आवश्यकता होती है। हम पैसे नहीं मांगते, लेकिन यदि आप चाहें, तो अपनी स्वेच्छा से कुछ योगदान दे सकते हैं। यह हमारी टीम को ऐप को लाइव रखने में मदद करेगा।'
            : 'Maintaining and developing this app requires significant effort and resources. we do not ask for money. However, if you wish, you can voluntarily contribute anything. This will help our team keep this app live and growing.',
        contributionTitle: isHindi ? 'योगदान (डिजिटल सेवा)' : 'Digital Seva (Support Us)',
        upiTitle: isHindi ? 'UPI के माध्यम से योगदान' : 'Support via UPI',
        videoTitle: isHindi ? 'वीडियो देखकर सहायता करें' : 'Support via Video Ad',
        videoDesc: isHindi ? 'एक छोटा विज्ञापन देखें, इसका योगदान डेवलपर को जाएगा।' : 'Watch a short video, the contribution goes to the developer.',
        version: 'Version 1.2.0',
        devBy: isHindi ? 'द्वारा विकसित: श्री कृष्ण भक्त टीम' : 'Developed by: Shri Krishna Devotee Team',
        disclaimerTitle: isHindi ? 'अस्वीकरण और शर्तें' : 'Disclaimer & Terms',
        disclaimerText: isHindi
            ? 'योगदान देने से पहले कृपया ध्यान दें:\n\n१. यह एक स्वैच्छिक उपहार है।\n२. यह राशि वापस नहीं की जाएगी (Non-refundable)।\n३. इसके बदले कोई डिजिटल सामग्री या सुविधा नहीं दी जाएगी।\n४. यह केवल ऐप के विकास और रखरखाव में सहायता के लिए है।'
            : 'Before contributing, please note:\n\n1. This is a voluntary gift.\n2. It is non-refundable.\n3. No digital goods or extra features are provided in return.\n4. It is solely to support the app\'s maintenance and growth.',
        acceptBtn: isHindi ? 'स्वीकार करें और योगदान दें' : 'Accept & Contribute',
        cancelBtn: isHindi ? 'रद्द करें' : 'Cancel'
    };

    const handleUPI = () => {
        setShowDisclaimer(true);
    };

    const confirmContribution = () => {
        setShowDisclaimer(false);
        const upiId = 'your-upi-id@upi'; // USER: Replace with your actual UPI ID
        const name = 'Shri Krishna App Dev';
        const url = `upi://pay?pa=${upiId}&pn=${name}&cu=INR`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(
                    isHindi ? "UPI ऐप्स नहीं मिले" : "No UPI Apps Found",
                    isHindi ? "कृपया अपने फोन में GPay, PhonePe या Paytm चेक करें।" : "Please check GPay, PhonePe or Paytm on your phone."
                );
            }
        });
    };

    const handleVideoAd = () => {
        Alert.alert(
            isHindi ? "वीडियो सेवा" : "Video Seva",
            isHindi
                ? "यह सुविधा जल्द ही आ रही है! आप शीघ्र ही वीडियो देखकर हमारा समर्थन कर सकेंगे।"
                : "This feature is coming soon! You will be able to support us by watching a video shortly."
        );
    };

    return (
        <ImageBackground
            source={{ uri: 'https://m.media-amazon.com/images/I/61k71BV8B3L._AC_UF1000,1000_QL80_.jpg' }}
            style={styles.background}
            blurRadius={15}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.title}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* App Logo/Icon */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="heart" size={60} color="#CD9730" />
                        </View>
                        <Text style={styles.appName}>Shri Krishna Wallpapers</Text>
                        <Text style={styles.version}>{t.version}</Text>
                    </View>

                    {/* Mission Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="ribbon" size={24} color="#CD9730" />
                            <Text style={styles.cardTitle}>{t.missionTitle}</Text>
                        </View>
                        <Text style={styles.cardBody}>{t.missionText}</Text>
                        <Text style={[styles.cardBody, { marginTop: 10 }]}>{t.sevaText}</Text>
                    </View>

                    {/* Support Options */}
                    <Text style={styles.sectionTitle}>{t.contributionTitle}</Text>

                    {/* <TouchableOpacity style={styles.supportButton} onPress={handleUPI}>
                        <View style={styles.supportIcon}>
                            <Ionicons name="card" size={24} color="#fff" />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={styles.supportTitle}>{t.upiTitle}</Text>
                            <Text style={styles.supportLabel}>GPay, PhonePe, Paytm, etc.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CD9730" />
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.supportButton} onPress={handleVideoAd}>
                        <View style={[styles.supportIcon, { backgroundColor: '#8b0000' }]}>
                            <Ionicons name="play-circle" size={24} color="#fff" />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={styles.supportTitle}>{t.videoTitle}</Text>
                            <Text style={styles.supportLabel}>{t.videoDesc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#CD9730" />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t.devBy}</Text>
                        <Text style={styles.footerSubText}>Made with ❤️ for Shri Krishna</Text>
                    </View>
                </ScrollView>

                {/* Disclaimer Modal */}
                <Modal
                    visible={showDisclaimer}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDisclaimer(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Ionicons name="alert-circle" size={28} color="#8b0000" />
                                <Text style={styles.modalTitle}>{t.disclaimerTitle}</Text>
                            </View>

                            <Text style={styles.modalBody}>{t.disclaimerText}</Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.cancelBtn]}
                                    onPress={() => setShowDisclaimer(false)}
                                >
                                    <Text style={styles.cancelBtnText}>{t.cancelBtn}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, styles.acceptBtn]}
                                    onPress={confirmContribution}
                                >
                                    <Text style={styles.acceptBtnText}>{t.acceptBtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    scrollContent: { padding: 20 },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    appName: { fontSize: 22, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    version: { fontSize: 14, color: '#ddd', marginTop: 5 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        elevation: 5
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#5e3a0e' },
    cardBody: { fontSize: 15, color: '#444', lineHeight: 22, textAlign: 'justify' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15, marginLeft: 5 },
    supportButton: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 3
    },
    supportIcon: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: '#CD9730',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    supportInfo: { flex: 1 },
    supportTitle: { fontSize: 16, fontWeight: 'bold', color: '#5e3a0e' },
    supportLabel: { fontSize: 12, color: '#666', marginTop: 2 },
    footer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { color: '#ddd', fontSize: 14, fontStyle: 'italic' },
    footerSubText: { color: '#aaa', fontSize: 12, marginTop: 5 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        elevation: 10
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8b0000'
    },
    modalBody: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 25
    },
    modalButtons: {
        flexDirection: 'column',
        gap: 10
    },
    btn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    acceptBtn: {
        backgroundColor: '#CD9730'
    },
    cancelBtn: {
        backgroundColor: '#f0f0f0'
    },
    acceptBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default AboutScreen;

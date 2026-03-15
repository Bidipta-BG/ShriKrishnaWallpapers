import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../contexts/LoadingContext';

const { width } = Dimensions.get('window');

const TRANSLATIONS = {
    en: {
        headerTitle: 'Divine AI Chat',
        comingSoon: 'COMMITTED TO SERVE',
        missionTitle: 'Live Interaction with Sri Krishna ji 🙏',
        missionMsg: 'Jai Sri Krishna! We are on a divine mission to bring Sri Krishna closer to you than ever before. We are currently developing a state-of-the-art AI model designed to let you chat and interact with Sri Krishna ji live, just like a real video call.',
        detailTitle: 'A Sacred Journey',
        detailMsg: 'This revolutionary feature requires extensive research, deep development, and significant resources. While we are committed to keeping this app completely free for all devotees, bringing such a high-end feature to life is a massive undertaking.',
        supportTitle: 'Your Support Matters',
        supportMsg: 'We humbly request your patience and support during this journey. You can directly contribute to the development process and help us keep this feature free by watching a short video. Every contribution brings us one step closer to Sri Krishna.',
        watchAdBtn: 'Support with an Ad ✨',
        thankYou: 'Jai Sri Krishna! Your support is recorded. Every prayer and contribution helps us in this divine mission.',
        loadingAd: 'Preparing video...',
    },
    hi: {
        headerTitle: 'दिव्य एआई चैट',
        comingSoon: 'सेवा के लिए प्रतिबद्ध',
        missionTitle: 'श्री कृष्ण जी के साथ लाइव बातचीत 🙏',
        missionMsg: 'जय श्री कृष्णा! हम श्री कृष्ण को आपके और भी करीब लाने के एक दिव्य मिशन पर हैं। हम वर्तमान में एक अत्याधुनिक एआई मॉडल विकसित कर रहे हैं जिसे श्री कृष्ण जी के साथ लाइव चैट और बातचीत करने के लिए डिज़ाइन किया गया है, ठीक एक वास्तविक वीडियो कॉल की तरह।',
        detailTitle: 'एक पवित्र यात्रा',
        detailMsg: 'इस क्रांतिकारी विशेषता के लिए व्यापक शोध, गहन विकास और महत्वपूर्ण संसाधनों की आवश्यकता है। हालांकि हम इस ऐप को सभी भक्तों के लिए पूरी तरह से मुफ्त रखने के लिए प्रतिबद्ध हैं, ऐसी उच्च-स्तरीय सुविधा को जीवन में लाना एक बहुत बड़ा कार्य है।',
        supportTitle: 'आपका समर्थन महत्वपूर्ण है',
        supportMsg: 'हम इस यात्रा के दौरान आपसे धैर्य और समर्थन का विनम्र अनुरोध करते हैं। आप एक छोटा वीडियो देखकर विकास प्रक्रिया में सीधे योगदान दे सकते हैं और इस सुविधा को मुफ्त में रखने में हमारी मदद कर सकते हैं। आपका हर योगदान हमें श्री कृष्ण के एक कदम और करीब लाता है।',
        watchAdBtn: 'विज्ञापन के साथ सहयोग करें ✨',
        thankYou: 'जय श्री कृष्णा! आपका समर्थन रिकॉर्ड किया गया है। हर प्रार्थना और योगदान हमें इस दिव्य मिशन में मदद करता है।',
        loadingAd: 'दिव्य वीडियो तैयार हो रहा है...',
    }
};

const ChatScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    const [isAdLoading, setIsAdLoading] = useState(false);
    const [isSupportAdActive, setIsSupportAdActive] = useState(false);
    const { showLoading, hideLoading } = useLoading();

    // Interstitial Ad Setup
    const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
    });

    useEffect(() => {
        if (isClosed && isSupportAdActive) {
            setIsSupportAdActive(false);
            hideLoading();
            Alert.alert(
                language === 'hi' ? 'जय श्री कृष्णा! 🙏' : 'Jai Sri Krishna! 🙏',
                t.thankYou
            );
        }
    }, [isClosed]);

    useEffect(() => {
        if (isLoaded && isSupportAdActive) {
            show();
        }
    }, [isLoaded]);

    // Ad Rotation Logic
    const BANNER_AD_IDS = [
        TestIds.BANNER,
        'ca-app-pub-3940256099942544/6300978111'
    ];
    const [adIndex, setAdIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAdIndex((prev) => (prev + 1) % BANNER_AD_IDS.length);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleWatchAd = () => {
        setIsSupportAdActive(true);
        showLoading(t.loadingAd);
        load();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.headerTitle}</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Banner Ad placement (below header) */}
            <View style={styles.adContainer}>
                <BannerAd
                    key={`ad-chat-${adIndex}`}
                    unitId={BANNER_AD_IDS[adIndex]}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.missionContainer}>
                    <LinearGradient
                        colors={['#1a1a2a', '#0a0a0a']}
                        style={styles.missionCard}
                    >
                        {/* Icon/Visual Section */}
                        <View style={styles.iconWrapper}>
                            <View style={styles.glowRing} />
                            <Image source={require('../assets/images/about-icon.png')} style={{ width: 100, height: 100, borderRadius: 50 }} resizeMode="cover" />

                            <View style={styles.glowDot} />
                        </View>

                        <View style={styles.badgeWrapper}>
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>{t.comingSoon}</Text>
                            </View>
                        </View>

                        {/* Text Content */}
                        <Text style={styles.missionTitle}>{t.missionTitle}</Text>
                        <Text style={styles.missionMsg}>{t.missionMsg}</Text>

                        <View style={styles.glassSection}>
                            <Text style={styles.detailTitle}>{t.detailTitle}</Text>
                            <Text style={styles.detailMsg}>{t.detailMsg}</Text>
                        </View>

                        <View style={styles.supportSection}>
                            <Text style={styles.supportTitle}>{t.supportTitle}</Text>
                            <Text style={styles.supportMsg}>{t.supportMsg}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.adBtn, isAdLoading && styles.disabledBtn]}
                            onPress={handleWatchAd}
                            disabled={isAdLoading}
                        >
                            <LinearGradient
                                colors={['#9c6ce6', '#6a4cad']}
                                style={styles.adBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isAdLoading ? (
                                    <View style={styles.btnRow}>
                                        <ActivityIndicator size="small" color="#FFF" />
                                        <Text style={styles.adBtnText}>{t.loadingAd}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.btnRow}>
                                        <Ionicons name="play-circle" size={24} color="#FFF" />
                                        <Text style={styles.adBtnText}>{t.watchAdBtn}</Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.footerNote}>
                            {language === 'hi' ? 'भविष्य में आने वाली एआई सुविधाओं के लिए बने रहें।' : 'Stay tuned for future AI features.'}
                        </Text>
                    </LinearGradient>
                </View>
            </ScrollView>

            <BottomNav navigation={navigation} activeTab="Chat" />
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
        backgroundColor: '#000',
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#1f1f1f',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4dabf7', // Neon blue primary
        letterSpacing: 0.5,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    missionContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    missionCard: {
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1f1f1f',
        elevation: 10,
        backgroundColor: '#0a0a0a',
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(77, 171, 247, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'rgba(77, 171, 247, 0.2)',
        opacity: 0.5,
    },
    iconGlow: {
        textShadowColor: 'rgba(77, 171, 247, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    glowDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4dabf7',
        bottom: 20,
        right: 20,
        shadowColor: '#4dabf7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 10,
    },
    badgeWrapper: {
        marginBottom: 15,
    },
    comingSoonBadge: {
        backgroundColor: 'rgba(156, 108, 230, 0.15)',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(156, 108, 230, 0.3)',
    },
    comingSoonText: {
        color: '#9c6ce6',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    missionTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        lineHeight: 32,
    },
    missionMsg: {
        color: '#CCC',
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 25,
    },
    glassSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailTitle: {
        color: '#9c6ce6',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailMsg: {
        color: '#AAA',
        fontSize: 13,
        lineHeight: 20,
    },
    supportSection: {
        width: '100%',
        marginBottom: 25,
        paddingHorizontal: 5,
    },
    supportTitle: {
        color: '#4dabf7',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    supportMsg: {
        color: '#AAA',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
    },
    adBtn: {
        width: '100%',
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#9c6ce6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    adBtnGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    adBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    footerNote: {
        color: '#444',
        fontSize: 11,
        marginTop: 20,
        fontStyle: 'italic',
    }
});

export default ChatScreen;

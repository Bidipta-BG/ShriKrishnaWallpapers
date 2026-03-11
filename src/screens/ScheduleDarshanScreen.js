import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const TRANSLATIONS = {
    en: {
        headerTitle: 'Bhakti Progress',
        divyaCoins: 'Divya Coins',
        punyaDays: 'Raksha Kavach (Shields)',
        currentStreak: 'Nitya Bhakti (Streak)',
        milestoneGoal: 'Next Milestone',
        totalStats: 'Devotional Merits',
        level: 'Bhakti Level',
        shieldDesc: 'A divine shield that protects your streak if you miss a day.',
        coinDesc: 'Rewards for your daily devotion.',
        footer: 'Sri Krishna is pleased with your constant devotion. 🙏',
        beginner: 'Sharanagat (Beginner)',
        intermediate: 'Sadhak (Devoted)',
        advanced: 'Bhakta (Advanced)',
        master: 'Param Bhakta (Divine)',
        streakMsg: (days) => `You have performed daily Puja for ${days} ${days === 1 ? 'day' : 'days'}. May the Lord bless you! 🙏`,
        buyCoins: 'Buy Divya Coins',
        goAdFree: 'Go Ad-Free',
        storeTitle: 'Sacred Offerings'
    },
    hi: {
        headerTitle: 'भक्ति की प्रगति',
        divyaCoins: 'दिव्य मुद्रा',
        punyaDays: 'रक्षा कवच (शील्ड)',
        currentStreak: 'नित्य भक्ति (स्ट्रेक)',
        milestoneGoal: 'अगला लक्ष्य',
        totalStats: 'आध्यात्मिक पुण्य',
        level: 'भक्ति का स्तर',
        shieldDesc: 'एक दिव्य कवच जो पूजा छूटने पर भी आपकी प्रगति को सुरक्षित रखता है।',
        coinDesc: 'नित्य सेवा के लिए प्राप्त पुण्य मुद्रा।',
        footer: 'श्री कृष्ण आपकी निरंतर भक्ति से अत्यंत प्रसन्न हैं। 🙏',
        beginner: 'शरणागत (शुरुआत)',
        intermediate: 'साधक (समर्पित)',
        advanced: 'भक्त (प्रगतिशील)',
        master: 'परम भक्त (दिव्य)',
        streakMsg: (days) => `आप पिछले ${days} ${days === 1 ? 'दिन' : 'दिनों'} से निरंतर प्रभु की सेवा कर रहे हैं। प्रभु की कृपा आप पर बनी रहे! 🙏`,
        buyCoins: 'दिव्य मुद्रा खरीदें',
        goAdFree: 'विज्ञापन मुक्त करें',
        storeTitle: 'धार्मिक भेंट'
    }
};

const ScheduleDarshanScreen = () => {
    const navigation = useNavigation();
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

    const [stats, setStats] = useState({
        streak: 1,
        goal: 7,
        coins: 0,
        shields: 0
    });

    // Ad Rotation Logic
    const BANNER_AD_IDS = [
        TestIds.BANNER,
        'ca-app-pub-3940256099942544/6300978111' // Rotating with test IDs for safety
    ];
    const [adIndex, setAdIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAdIndex((prevIndex) => (prevIndex + 1) % BANNER_AD_IDS.length);
        }, 30000); // 30 seconds rotation
        return () => clearInterval(interval);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        try {
            const streak = await AsyncStorage.getItem('currentStreak');
            const goal = await AsyncStorage.getItem('streakGoal');
            const coins = await AsyncStorage.getItem('divyaCoins');
            const shields = await AsyncStorage.getItem('punyaDays');

            setStats({
                streak: parseInt(streak) || 1,
                goal: parseInt(goal) || 7,
                coins: parseInt(coins) || 0,
                shields: parseInt(shields) || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const getLevel = () => {
        if (stats.coins > 100) return t.master;
        if (stats.coins > 50) return t.advanced;
        if (stats.coins > 20) return t.intermediate;
        return t.beginner;
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
                    <Text style={styles.headerTitle}>{t.headerTitle}</Text>
                </View>

                <View style={{ flex: 1 }}>
                    {/* 1. Milestone Progress Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{t.level}</Text>
                        <Text style={styles.levelText}>{getLevel()}</Text>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>{t.milestoneGoal}</Text>
                                <Text style={styles.progressValue}>{stats.streak}/{stats.goal} {language === 'hi' ? 'दिन' : 'Days'}</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${Math.min((stats.streak / stats.goal) * 100, 100)}%` }]} />
                            </View>
                        </View>
                    </View>

                    {/* 2. Main Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.card, styles.statCard]}>
                            <Ionicons name="star" size={32} color="#FFD700" />
                            <Text style={styles.statLabel}>{t.divyaCoins}</Text>
                            <Text style={styles.statValue}>{stats.coins}</Text>
                            <Text style={styles.statDesc}>{t.coinDesc}</Text>
                        </View>

                        <View style={[styles.card, styles.statCard]}>
                            <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
                            <Text style={styles.statLabel}>{t.punyaDays}</Text>
                            <Text style={styles.statValue}>{stats.shields}</Text>
                            <Text style={styles.statDesc}>{t.shieldDesc}</Text>
                        </View>
                    </View>

                    {/* 3. Daily Streak Card */}
                    <View style={styles.card}>
                        <View style={styles.streakHeader}>
                            <View style={styles.streakInfo}>
                                <Text style={styles.statLabel}>{t.currentStreak}</Text>
                                <Text style={[styles.statValue, { textAlign: 'left' }]}>{stats.streak}</Text>
                            </View>
                            <View style={styles.flameIcon}>
                                <Ionicons name="flame" size={40} color="#FF5722" />
                            </View>
                        </View>
                        <Text style={styles.statDesc}>
                            {t.streakMsg(stats.streak)}
                        </Text>
                    </View>

                    {/* 4. Store Row (Side-by-Side) - Commented out as per request */}
                    {/* 
                    <View style={styles.storeRow}>
                        <TouchableOpacity style={[styles.card, styles.storeSmallCard]} activeOpacity={0.8}>
                            <View style={styles.storeButtonIcon}>
                                <Ionicons name="cart" size={20} color="#CD9730" />
                            </View>
                            <Text style={styles.storeSmallText}>{t.buyCoins}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.card, styles.storeSmallCard]} activeOpacity={0.8}>
                            <View style={[styles.storeButtonIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="ban" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.storeSmallText}>{t.goAdFree}</Text>
                        </TouchableOpacity>
                    </View>
                    */}

                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t.footer}</Text>
                </View>

                {/* Banner Ad at fixed bottom */}
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={BANNER_AD_IDS[adIndex]}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                    />
                </View>
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
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8
    },
    sectionTitle: { fontSize: 14, color: '#666', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
    levelText: { fontSize: 28, fontWeight: 'bold', color: '#5e3a0e', marginBottom: 20 },
    progressContainer: { marginTop: 10 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 14, color: '#333', fontWeight: '600' },
    progressValue: { fontSize: 14, color: '#CD9730', fontWeight: 'bold' },
    progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#CD9730' },
    statsGrid: { flexDirection: 'row', paddingHorizontal: 10 },
    statCard: { flex: 1, marginHorizontal: 10, alignItems: 'center', padding: 15 },
    statLabel: { fontSize: 13, color: '#666', fontWeight: 'bold', marginVertical: 8, textAlign: 'center' },
    statValue: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    statDesc: { fontSize: 10, color: '#888', textAlign: 'center' },
    streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    streakInfo: { flex: 1 },
    flameIcon: { backgroundColor: '#FFCCBC', padding: 10, borderRadius: 15 },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerText: {
        color: '#fff',
        fontSize: 15,
        fontStyle: 'italic',
        opacity: 0.9,
        textAlign: 'center'
    },
    storeRow: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginTop: 5
    },
    storeSmallCard: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    storeButtonIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF8E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    storeSmallText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 5,
        width: '100%',
    }
});

export default ScheduleDarshanScreen;

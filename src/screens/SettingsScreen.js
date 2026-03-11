import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../contexts/LoadingContext';

const SETTINGS_TRANSLATIONS = {
    en: {
        header: 'Settings',
        yourCoins: 'Your Coins',
        earnCoins: 'Earn coins by watching ads',
        watchAd: 'WATCH AD (+10)',
        shareEarn: 'Share & Earn',
        coinBonus: '+100 Coins',
        forFriend: 'For you & your friend',
        referDesc: 'Refer your friend and both will get 100 Divya Coins.',
        inviteCode: 'YOUR INVITE CODE',
        pendingRewards: 'Pending Rewards Found!',
        bhaktasUsed: 'bhaktas used your code',
        enterInvite: 'ENTER INVITE CODE',
        claim: 'CLAIM',
        rewardClaimed: 'INVITE REWARD CLAIMED',
        supportInfo: 'Support & Info',
        rateUs: 'Rate Us',
        contact: 'Contact / Feedback',
        language: 'Change Language',
        privacy: 'Privacy Policy',
        about: 'About Us',
        version: 'Version',
        invalidCode: 'Invalid Code',
        invalidCodeMsg: 'Please enter a valid invite code.',
        jaiSriKrishna: 'Jai Sri Krishna!',
        rewardMsg: 'You have received 100 Divya Coins! Your friend will also be rewarded.',
        redeemFailed: 'Redeem Failed',
        redeemFailedMsg: 'Could not redeem this code.',
        error: 'Error',
        errorMsg: 'Something went wrong. Please try again.',
        rewardsClaimed: 'Rewards Claimed!',
        rewardsClaimedMsg: 'Jai Sri Krishna! You earned {reward} Divya Coins from your referrals.',
        blessed: 'Blessed!',
        blessedMsg: 'You earned 10 Divya Coins for your devotion.',
        serenity: 'Divine Serenity',
        serenityMsg: 'Ads have been removed for the next 5 minutes.',
        shareMsg: 'Look! I found this wonderful app to express my bhakti to Lord Shri Krishna and perform a sacred puja even within my busy daily schedule. 🌸 It has truly helped me stay focused and find peace amidst the chaos of life. Download here: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti',
        inviteShareMsg: 'Look! I found this wonderful app to express my bhakti to Lord Shri Krishna and perform a sacred puja even within my busy daily schedule. 🌸 It has truly helped me stay focused and find peace. Use my invite code {code} to get 100 Divya Coins and start your spiritual journey! Download now: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti',
        supportUs: 'Support Us',
        supportUsTitle: 'Support Our Mission 🙏',
        supportUsMsg: 'Would you like to support the development and maintenance of this app by watching a short video?',
        watchNow: 'Watch Now',
        exploreApps: 'Explore our other apps',
        exploreAppsSub: 'Discover more divine creations'
    },
    hi: {
        header: 'सेटिंग्स',
        yourCoins: 'आपकी दिव्य मुद्रा',
        earnCoins: 'विज्ञापन देखकर मुद्रा कमाएं',
        watchAd: 'विज्ञापन देखें (+10)',
        shareEarn: 'साझा करें और कमाएं',
        coinBonus: '+100 मुद्रा',
        forFriend: 'आपके और आपके मित्र के लिए',
        referDesc: 'अपने मित्र को रेफर करें और दोनों को 100 दिव्य मुद्रा मिलेगी।',
        inviteCode: 'आपका आमंत्रण कोड',
        pendingRewards: 'पुरस्कार मिले!',
        bhaktasUsed: 'भक्तों ने आपके कोड का उपयोग किया',
        enterInvite: 'आमंत्रण कोड दर्ज करें',
        claim: 'प्राप्त करें',
        rewardClaimed: 'इनाम प्राप्त किया गया',
        supportInfo: 'सहायता और जानकारी',
        rateUs: 'हमें रेट करें',
        contact: 'संपर्क / फीडबैक',
        language: 'भाषा बदलें',
        privacy: 'गोपनीयता नीति',
        about: 'हमारे बारे में',
        version: 'वर्जन',
        invalidCode: 'अमान्य कोड',
        invalidCodeMsg: 'कृपया एक मान्य आमंत्रon कोड दर्ज करें।',
        jaiSriKrishna: 'जय श्री कृष्णा!',
        rewardMsg: 'आपको 100 दिव्य मुद्रा प्राप्त हुई हैं! आपके मित्र को भी पुरस्कृत किया जाएगा।',
        redeemFailed: 'रिडीम विफल',
        redeemFailedMsg: 'यह कोड रिडीम नहीं किया जा सका।',
        error: 'त्रुटि',
        errorMsg: 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
        rewardsClaimed: 'पुरस्कार प्राप्त हुए!',
        rewardsClaimedMsg: 'जय श्री कृष्णा! आपने अपने रेफरल से {reward} दिव्य मुद्रा अर्जित की हैं।',
        blessed: 'आशीर्वाद!',
        blessedMsg: 'आपने अपनी भक्ति के लिए 10 दिव्य मुद्रा अर्जित की हैं।',
        serenity: 'दिव्य शांति',
        serenityMsg: 'अगले 5 मिनट के लिए विज्ञापन हटा दिए गए हैं।',
        shareMsg: 'देखिए! मुझे भगवान श्री कृष्ण की भक्ति व्यक्त करने और अपने व्यस्त दैनिक जीवन के बीच भी पवित्र पूजा करने के लिए यह अद्भुत ऐप मिला है। 🌸 इसने वास्तव में मुझे जीवन की आपाधापी के बीच ध्यान केंद्रित करने और शांति पाने में मदद की है। अभी डाउनलोड करें: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti',
        inviteShareMsg: 'देखिए! मुझे भगवान श्री कृष्ण की भक्ति व्यक्त करने और अपने व्यस्त दैनिक जीवन के बीच भी पवित्र पूजा करने के लिए यह अद्भुत ऐप मिला है। 🌸 इसने वास्तव में मुझे जीवन की आपाधापी के बीच ध्यान केंद्रित करने और शांति पाने में मदद की है। मेरा आमंत्रण कोड {code} उपयोग करें और 100 दिव्य मुद्रा प्राप्त करें और अपनी आध्यात्मिक यात्रा शुरू करें! अभी डाउनलोड करें: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti',
        supportUs: 'हमें सहयोग करें',
        supportUsTitle: 'हमारे मिशन का समर्थन करें 🙏',
        supportUsMsg: 'क्या आप एक छोटा वीडियो देखकर इस ऐप के विकास और रखरखाव का समर्थन करना चाहेंगे?',
        watchNow: 'अभी देखें',
        exploreApps: 'हमारे अन्य ऐप्स देखें',
        exploreAppsSub: 'अधिक दिव्य कृतियों की खोज करें'
    }
};

const SettingsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const t = SETTINGS_TRANSLATIONS[language] || SETTINGS_TRANSLATIONS.en;
    const [currentCoins, setCurrentCoins] = useState(0);
    const [adFreeUntil, setAdFreeUntil] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [inviteCode, setInviteCode] = useState('');
    const [isProcessingReferral, setIsProcessingReferral] = useState(false);
    const [hasRedeemed, setHasRedeemed] = useState(false);
    const { showLoading, hideLoading } = useLoading();

    // Interstitial Ad Setup
    const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
    });

    const [adActionType, setAdActionType] = useState(null); // 'coins' or 'no_ads'

    // Handle Ad Completion/Close
    useEffect(() => {
        if (isClosed && adActionType) {
            const completedType = adActionType;
            setAdActionType(null); // Reset before rewarding to prevent loops
            hideLoading();

            // Short delay to let the ad modal clean up before showing our Alert
            setTimeout(() => {
                rewardUser(completedType);
            }, 500);
        }
    }, [isClosed]);

    // Show ad when loaded (if we are waiting for it)
    useEffect(() => {
        if (isLoaded && adActionType) {
            show();
        }
    }, [isLoaded]);

    const rewardUser = async (type) => {
        try {
            if (type === 'coins') {
                setCurrentCoins(prev => {
                    const newTotal = (prev || 0) + 10;
                    AsyncStorage.setItem('divyaCoins', newTotal.toString());
                    return newTotal;
                });
                Alert.alert(t.blessed, t.blessedMsg);
            } else if (type === 'no_ads') {
                const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes for testing
                setAdFreeUntil(expiry);
                await AsyncStorage.setItem('ad_free_expiry', expiry.toString());
                Alert.alert(t.serenity, t.serenityMsg);
            }
        } catch (error) {
            console.error('Error rewarding:', error);
        }
    };

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

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Check ad-free expiry every minute
    useEffect(() => {
        const interval = setInterval(() => {
            if (adFreeUntil && adFreeUntil < Date.now()) {
                setAdFreeUntil(null);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [adFreeUntil]);

    useEffect(() => {
        initializeReferral();
    }, []);

    const getOrGenerateDeviceId = async () => {
        try {
            let id = await AsyncStorage.getItem('divya_device_id');
            if (!id) {
                id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await AsyncStorage.setItem('divya_device_id', id);
            }
            return id;
        } catch (e) {
            return 'anonymous_device';
        }
    };

    const initializeReferral = async () => {
        const id = await getOrGenerateDeviceId();
        setDeviceId(id);
        fetchReferralStatus(id);

        const redeemed = await AsyncStorage.getItem('referral_redeemed');
        if (redeemed === 'true') setHasRedeemed(true);
    };

    const fetchReferralStatus = async (id) => {
        try {
            const response = await fetch(`https://api.thevibecoderagency.online/api/srikrishna-aarti/referral/status?deviceId=${id}`);
            const result = await response.json();
            if (result.success) {
                setReferralCode(result.referralCode);
                setPendingRewards(result.pendingRewards || 0);
            }
        } catch (error) {
            console.error('Referral status error:', error);
        }
    };

    const handleRedeem = async () => {
        if (!inviteCode || inviteCode.trim().length < 5) {
            Alert.alert(t.invalidCode, t.invalidCodeMsg);
            return;
        }

        setIsProcessingReferral(true);
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/referral/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviteCode: inviteCode.trim().toUpperCase(),
                    deviceId: deviceId
                })
            });
            const result = await response.json();

            if (result.success) {
                setCurrentCoins(prev => {
                    const newTotal = (prev || 0) + 100;
                    AsyncStorage.setItem('divyaCoins', newTotal.toString());
                    return newTotal;
                });
                await AsyncStorage.setItem('referral_redeemed', 'true');
                setHasRedeemed(true);
                setInviteCode('');
                Alert.alert(t.jaiSriKrishna, t.rewardMsg);
            } else {
                Alert.alert(t.redeemFailed, result.message || t.redeemFailedMsg);
            }
        } catch (error) {
            Alert.alert(t.error, t.errorMsg);
        } finally {
            setIsProcessingReferral(false);
        }
    };

    const handleClaimRewards = async () => {
        setIsProcessingReferral(true);
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/referral/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: deviceId })
            });
            const result = await response.json();

            if (result.success) {
                const rewardTotal = pendingRewards * 100;
                setCurrentCoins(prev => {
                    const newTotal = (prev || 0) + rewardTotal;
                    AsyncStorage.setItem('divyaCoins', newTotal.toString());
                    return newTotal;
                });
                setPendingRewards(0);
                Alert.alert(t.rewardsClaimed, t.rewardsClaimedMsg.replace('{reward}', rewardTotal));
            }
        } catch (error) {
            console.error('Claim error:', error);
        } finally {
            setIsProcessingReferral(false);
        }
    };

    const loadData = async () => {
        try {
            const [storedCoins, storedAdFree] = await Promise.all([
                AsyncStorage.getItem('divyaCoins'),
                AsyncStorage.getItem('ad_free_expiry')
            ]);

            if (storedCoins) setCurrentCoins(parseInt(storedCoins));
            if (storedAdFree) setAdFreeUntil(parseInt(storedAdFree));

        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleWatchAd = async (type) => {
        setAdActionType(type);
        if (isLoaded) {
            show();
        } else {
            showLoading(language === 'hi' ? 'दिव्य विज्ञापन तैयार हो रहा है...' : 'Preparing ad...');
            load();
        }
    };

    // --- New Feature Handlers ---

    const handleShare = async () => {
        try {
            await Share.share({
                message: t.shareMsg,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleRate = () => {
        const packageName = 'com.thevibecoder.shrikrishnadailypujaaarti';
        const url = Platform.OS === 'android'
            ? `market://details?id=${packageName}`
            : `https://play.google.com/store/apps/details?id=${packageName}`; // Fallback for now, iOS ID needed later

        Linking.openURL(url).catch(err => {
            console.error('Error opening store:', err);
            // Fallback to web link if market:// fails
            Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
        });
    };

    const handleContact = () => {
        // Replace with your actual support email
        Linking.openURL('mailto:support@axomitlab.com?subject=Sri Krishna Puja App Feedback');
    };

    const handlePrivacy = () => {
        // Replace with your actual privacy policy URL
        Linking.openURL('https://bidipta-bg.github.io/ShriKrishnaWallpapers/privacy-policy.html');
    };

    const handleAbout = () => {
        navigation.navigate('About');
    };

    const handleLanguage = () => {
        navigation.navigate('LanguageSelection'); // Using existing screen
    };

    const handleSupportUs = () => {
        Alert.alert(
            t.supportUsTitle,
            t.supportUsMsg,
            [
                { text: language === 'hi' ? 'नहीं' : 'Not Now', style: 'cancel' },
                {
                    text: t.watchNow,
                    onPress: () => handleWatchAd('coins'), // Reusing watch ad logic
                    style: 'default'
                }
            ]
        );
    };

    const handleExploreApps = () => {
        const developerUrl = 'https://play.google.com/store/apps/developer?id=Axom+IT+Lab'; // Axom IT Lab developer page
        Linking.openURL(developerUrl).catch(err => {
            console.error('Error opening developer page:', err);
        });
    };

    const MenuOption = ({ icon, title, onPress, color = '#fff' }) => (
        <TouchableOpacity style={styles.menuOption} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: '#1a1a1a' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#9c6ce6" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.header}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Banner Ad placement (Below Header) */}
            <View style={styles.adContainer}>
                <BannerAd
                    key={`ad-settings-${adIndex}`}
                    unitId={BANNER_AD_IDS[adIndex]}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Coins Card */}
                <View style={[styles.card, styles.coinsCard]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet" size={40} color="#D4AF37" style={{ marginRight: 15 }} />
                        <View>
                            <Text style={styles.cardTitle}>{t.yourCoins}</Text>
                            <Text style={styles.coinBalance}>{currentCoins}</Text>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFA500" />
                            <Text style={styles.featureText}>{t.earnCoins}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#4caf50' }]} onPress={() => handleWatchAd('coins')}>
                        <Text style={styles.buyButtonText}>{t.watchAd}</Text>
                    </TouchableOpacity>
                </View>

                {/* Referral Card */}
                <LinearGradient
                    colors={['#1a1a1a', '#2d2d2d']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconCircleGold, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
                            <Ionicons name="people" size={24} color="#D4AF37" />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{t.shareEarn}</Text>
                            <View style={styles.priceRow}>
                                <Text style={[styles.price, { color: '#D4AF37' }]}>{t.coinBonus}</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tagText}>{t.forFriend}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
                            <Text style={styles.featureText}>{t.referDesc}</Text>
                        </View>
                    </View>

                    {/* Referrer Section */}
                    {referralCode && (
                        <View style={styles.referralInfoBox}>
                            <Text style={styles.referralLabel}>{t.inviteCode}</Text>
                            <View style={styles.codeRow}>
                                <Text style={styles.codeText}>{referralCode}</Text>
                                <TouchableOpacity
                                    style={styles.copyBtn}
                                    onPress={() => {
                                        Share.share({
                                            message: t.inviteShareMsg.replace('{code}', referralCode)
                                        });
                                    }}
                                >
                                    <Ionicons name="share-social" size={20} color="#D4AF37" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Pending Rewards Section */}
                    {pendingRewards > 0 && (
                        <TouchableOpacity
                            style={styles.claimRewardsBox}
                            onPress={handleClaimRewards}
                            disabled={isProcessingReferral}
                        >
                            <View>
                                <Text style={styles.claimTitle}>{t.pendingRewards}</Text>
                                <Text style={styles.claimSub}>{pendingRewards} {t.bhaktasUsed}</Text>
                            </View>
                            <View style={styles.claimAction}>
                                <Text style={styles.claimCount}>+{pendingRewards * 100}</Text>
                                <Ionicons name="gift" size={20} color="#000" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* New User Redemption Section */}
                    {!hasRedeemed ? (
                        <View style={styles.redeemSection}>
                            <TextInput
                                style={styles.redeemInput}
                                placeholder={t.enterInvite}
                                placeholderTextColor="#666"
                                value={inviteCode}
                                onChangeText={setInviteCode}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity
                                style={[styles.redeemBtn, { opacity: inviteCode.length > 0 ? 1 : 0.6 }]}
                                onPress={handleRedeem}
                                disabled={isProcessingReferral || inviteCode.length === 0}
                            >
                                {isProcessingReferral ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.redeemBtnText}>{t.claim}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.redeemedBadge}>
                            <Ionicons name="checkmark-done-circle" size={18} color="#4caf50" />
                            <Text style={styles.redeemedText}>{t.rewardClaimed}</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Explore Other Apps Card */}
                <TouchableOpacity
                    style={[styles.card, styles.exploreCard]}
                    onPress={handleExploreApps}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconCircleBlue, { backgroundColor: 'rgba(77, 171, 247, 0.2)' }]}>
                            <Ionicons name="apps" size={24} color="#4dabf7" />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{t.exploreApps}</Text>
                            <Text style={styles.exploreSubText}>{t.exploreAppsSub}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#4dabf7" />
                    </View>
                </TouchableOpacity>

                {/* Remove Ads Card */}
                {/* <LinearGradient
                    colors={['#1a1a1a', '#2d2d2d']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircleRed}>
                            <Text style={styles.adsIconText}>ADS</Text>
                            <View style={styles.strikeThrough} />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>Remove Ads – 5 Minutes</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.price}>FREE</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tagText}>Watch ad to unlock</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#9c6ce6" />
                            <Text style={styles.featureText}>Clean & distraction-free experience</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.buyButton, adFreeUntil > Date.now() && styles.disabledButton]}
                        onPress={() => handleWatchAd('no_ads')}
                        disabled={adFreeUntil > Date.now()}
                    >
                        <Text style={styles.buyButtonText}>
                            {adFreeUntil > Date.now() ? 'ACTIVE' : 'WATCH AD'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient> */}


                {/* New Feature List */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionHeader}>{t.supportInfo}</Text>

                    <MenuOption
                        icon="star"
                        title={t.rateUs}
                        onPress={handleRate}
                        color="#FFD700"
                    />
                    <MenuOption
                        icon="heart"
                        title={t.supportUs}
                        onPress={handleSupportUs}
                        color="#f06595"
                    />
                    <MenuOption
                        icon="mail"
                        title={t.contact}
                        onPress={handleContact}
                        color="#ff6b6b"
                    />
                    <MenuOption
                        icon="language"
                        title={t.language}
                        onPress={handleLanguage}
                        color="#9c6ce6"
                    />
                    <MenuOption
                        icon="shield-checkmark"
                        title={t.privacy}
                        onPress={handlePrivacy}
                        color="#4caf50"
                    />
                    <MenuOption
                        icon="information-circle"
                        title={t.about}
                        onPress={handleAbout}
                        color="#fff"
                    />
                </View>

                <Text style={styles.versionText}>{t.version} 1.0.0</Text>

            </ScrollView>
        </View>
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
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#9c6ce6',
        textAlign: 'center',
        flex: 1,
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#000',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    card: {
        borderRadius: 20,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircleRed: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ff4444',
        marginRight: 15,
        position: 'relative',
    },
    iconCircleGold: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#D4AF37',
        marginRight: 15,
    },
    iconCircleBlue: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4dabf7',
        marginRight: 15,
    },
    adsIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    strikeThrough: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#ff4444',
        transform: [{ rotate: '-45deg' }],
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    price: {
        color: '#c490ff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    tagContainer: {
        backgroundColor: '#3d2b4d',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#c490ff',
        fontSize: 10,
        fontWeight: '600',
    },
    featuresList: {
        gap: 8,
        marginBottom: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    featureText: {
        color: '#ddd',
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
    buyButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 30,
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    coinsCard: {
        backgroundColor: '#1a1a10',
        borderColor: '#333',
    },
    coinBalance: {
        color: '#ffd700',
        fontSize: 24,
        fontWeight: 'bold',
    },
    exploreCard: {
        backgroundColor: '#0a0a0a',
        borderColor: '#222',
    },
    exploreSubText: {
        color: '#666',
        fontSize: 12,
    },
    // New Styles for Menu
    menuSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        color: '#666',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
        fontWeight: '500',
    },
    versionText: {
        color: '#444',
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 12,
    },
    disabledButton: {
        backgroundColor: '#444',
        opacity: 0.7,
    },
    // Ad Overlay
    adOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    adContainer: {
        alignItems: 'center',
        gap: 15,
    },
    adText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    adSubText: {
        color: '#aaa',
        fontSize: 14,
    },
    // Referral UI
    referralInfoBox: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        marginBottom: 15,
    },
    referralLabel: {
        color: '#D4AF37',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 1,
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    copyBtn: {
        padding: 8,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        borderRadius: 8,
    },
    redeemSection: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    redeemInput: {
        flex: 1,
        height: 44,
        backgroundColor: '#000',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        color: '#fff',
        paddingHorizontal: 15,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    redeemBtn: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 20,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    redeemBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    claimRewardsBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFA500',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    claimTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    claimSub: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 11,
    },
    claimAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    claimCount: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    redeemedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 10,
    },
    redeemedText: {
        color: '#4caf50',
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default SettingsScreen;

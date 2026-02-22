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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [currentCoins, setCurrentCoins] = useState(0);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adFreeUntil, setAdFreeUntil] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [inviteCode, setInviteCode] = useState('');
    const [isProcessingReferral, setIsProcessingReferral] = useState(false);
    const [hasRedeemed, setHasRedeemed] = useState(false);

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
            let id = await AsyncStorage.getItem('astro_device_id');
            if (!id) {
                id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await AsyncStorage.setItem('astro_device_id', id);
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
            Alert.alert('Invalid Code', 'Please enter a valid invite code.');
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
                    const newTotal = (prev || 0) + 50;
                    AsyncStorage.setItem('divyaCoins', newTotal.toString());
                    return newTotal;
                });
                await AsyncStorage.setItem('referral_redeemed', 'true');
                setHasRedeemed(true);
                setInviteCode('');
                Alert.alert('Jai Shri Krishna!', 'You have received 50 Divya Coins! Your friend will also be rewarded.');
            } else {
                Alert.alert('Redeem Failed', result.message || 'Could not redeem this code.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
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
                const rewardTotal = pendingRewards * 50;
                setCurrentCoins(prev => {
                    const newTotal = (prev || 0) + rewardTotal;
                    AsyncStorage.setItem('divyaCoins', newTotal.toString());
                    return newTotal;
                });
                setPendingRewards(0);
                Alert.alert('Rewards Claimed!', `Jai Shri Krishna! You earned ${rewardTotal} Divya Coins from your referrals.`);
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
        setIsWatchingAd(true);

        // Simulate ad watching duration (3 seconds)
        setTimeout(async () => {
            try {
                if (type === 'coins') {
                    setCurrentCoins(prev => {
                        const newTotal = (prev || 0) + 5;
                        AsyncStorage.setItem('divyaCoins', newTotal.toString());
                        return newTotal;
                    });
                    Alert.alert('Blessed!', 'You earned 5 Divya Coins for your devotion.');
                } else if (type === 'no_ads') {
                    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes for testing
                    setAdFreeUntil(expiry);
                    await AsyncStorage.setItem('ad_free_expiry', expiry.toString());
                    Alert.alert('Divine Serenity', 'Ads have been removed for the next 5 minutes.');
                }
            } catch (error) {
                console.error('Error rewarding:', error);
            } finally {
                setIsWatchingAd(false);
            }
        }, 3000);
    };

    // --- New Feature Handlers ---

    const handleShare = async () => {
        try {
            await Share.share({
                message:
                    'Check out this amazing Shri Krishna Daily Puja & Aarti app! 🌸 Perform daily rituals and get beautiful wallpapers. Download now: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnapuja',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleRate = () => {
        const packageName = 'com.thevibecoder.shrikrishnapuja';
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
        Linking.openURL('mailto:support@axomitlab.com?subject=Shri Krishna App Feedback');
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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
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
                            <Text style={styles.cardTitle}>Your Coins</Text>
                            <Text style={styles.coinBalance}>{currentCoins}</Text>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFA500" />
                            <Text style={styles.featureText}>Earn coins by watching ads</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#4caf50' }]} onPress={() => handleWatchAd('coins')}>
                        <Text style={styles.buyButtonText}>WATCH AD (+5)</Text>
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
                            <Text style={styles.cardTitle}>Share & Earn</Text>
                            <View style={styles.priceRow}>
                                <Text style={[styles.price, { color: '#D4AF37' }]}>+50 Coins</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tagText}>For you & your friend</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
                            <Text style={styles.featureText}>Refer your friend and both will get 50 Divya Coins.</Text>
                        </View>
                    </View>

                    {/* Referrer Section */}
                    {referralCode && (
                        <View style={styles.referralInfoBox}>
                            <Text style={styles.referralLabel}>YOUR INVITE CODE</Text>
                            <View style={styles.codeRow}>
                                <Text style={styles.codeText}>{referralCode}</Text>
                                <TouchableOpacity
                                    style={styles.copyBtn}
                                    onPress={() => {
                                        Share.share({
                                            message: `Use my invite code ${referralCode} in the Shri Krishna app and get 50 Divya Coins! Download now: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnapuja`
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
                                <Text style={styles.claimTitle}>Pending Rewards Found!</Text>
                                <Text style={styles.claimSub}>{pendingRewards} bhaktas used your code</Text>
                            </View>
                            <View style={styles.claimAction}>
                                <Text style={styles.claimCount}>+{pendingRewards * 50}</Text>
                                <Ionicons name="gift" size={20} color="#000" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* New User Redemption Section */}
                    {!hasRedeemed ? (
                        <View style={styles.redeemSection}>
                            <TextInput
                                style={styles.redeemInput}
                                placeholder="ENTER INVITE CODE"
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
                                    <Text style={styles.redeemBtnText}>CLAIM</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.redeemedBadge}>
                            <Ionicons name="checkmark-done-circle" size={18} color="#4caf50" />
                            <Text style={styles.redeemedText}>INVITE REWARD CLAIMED</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Remove Ads Card */}
                <LinearGradient
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
                </LinearGradient>


                {/* New Feature List */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionHeader}>Support & Info</Text>

                    <MenuOption
                        icon="star"
                        title="Rate Us"
                        onPress={handleRate}
                        color="#FFD700"
                    />
                    <MenuOption
                        icon="mail"
                        title="Contact / Feedback"
                        onPress={handleContact}
                        color="#ff6b6b"
                    />
                    {/* <MenuOption
                        icon="language"
                        title="Change Language"
                        onPress={handleLanguage}
                        color="#9c6ce6"
                    /> */}
                    <MenuOption
                        icon="shield-checkmark"
                        title="Privacy Policy"
                        onPress={handlePrivacy}
                        color="#4caf50"
                    />
                    <MenuOption
                        icon="information-circle"
                        title="About Us"
                        onPress={handleAbout}
                        color="#fff"
                    />
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>

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

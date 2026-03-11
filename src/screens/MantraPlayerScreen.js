import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Modal,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../contexts/LoadingContext';
import { loadUserCoins, saveUserCoins } from '../utils/samagri_helpers';

const MantraPlayerScreen = ({ route, navigation }) => {
    const { mantra } = route.params;
    const { language } = useLanguage();
    const isHindi = language === 'hi';

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [rewardEarned, setRewardEarned] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [isAdActionActive, setIsAdActionActive] = useState(false);
    const { showLoading, hideLoading } = useLoading();

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

    // Interstitial Ad Setup
    const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
    });

    // Handle Ad Completion/Close
    useEffect(() => {
        if (isClosed && isAdActionActive) {
            setIsAdActionActive(false);
            hideLoading();
            navigation.goBack();
        }
    }, [isClosed]);

    // Show ad when loaded
    useEffect(() => {
        if (isLoaded && isAdActionActive) {
            show();
        }
    }, [isLoaded]);

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            setShowSupportModal(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    const handleExitWithAd = () => {
        setShowSupportModal(false);
        setIsAdActionActive(true);
        showLoading(isHindi ? 'दिव्य विज्ञापन तैयार हो रहा है...' : 'Preparing ad...');
        load();
    };

    const handleExitDirectly = () => {
        setShowSupportModal(false);
        navigation.goBack();
    };

    useEffect(() => {
        loadAudio();
    }, []);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const loadAudio = async () => {
        if (!mantra.music) {
            console.log('No music URL provided for this mantra');
            setIsLoading(false);
            return;
        }

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: mantra.music },
                { shouldPlay: false, isLooping: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            // Autoplay removed as per user request
            setIsPlaying(false);
        } catch (error) {
            console.error('Error loading audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsBuffering(status.isBuffering);
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);

            // Trigger reward on completion
            if (status.didJustFinish && !rewardEarned) {
                handleMantraCompletion();
            }
        }
    };

    const handleMantraCompletion = async () => {
        setRewardEarned(true);
        setIsPlaying(false);
        const currentCoins = await loadUserCoins();
        await saveUserCoins(currentCoins + 10);
        setShowRewardModal(true);
    };

    const handleShare = async () => {
        try {
            const message = isHindi
                ? `मैंने अभी ${mantra.title} सुना और 10 दिव्य सिक्के कमाए! 🙏✨ आप भी आध्यात्मिक शांति के लिए इस ऐप को डाउनलोड करें: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`
                : `I just finished listening to ${mantra.title} and earned 10 Divya Coins! 🙏✨ Join me for a spiritual journey: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const formatTime = (millis) => {
        if (!millis || millis < 0) return '00:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const remainingTime = duration - position;

    const togglePlayPause = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    };

    const stopAudio = async () => {
        if (!sound) return;
        await sound.stopAsync();
        setIsPlaying(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowSupportModal(true)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isHindi ? 'मंत्र श्रवण' : 'Mantra Listening'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* God Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: mantra.image || 'https://i.ibb.co/vzB7pLp/lord-krishna.png' }}
                        style={styles.godImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Mantra Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.sanskritText}>{mantra.sans}</Text>
                    <Text style={styles.titleText}>{isHindi ? mantra.title : mantra.title}</Text>

                    <View style={styles.benefitBox}>
                        <Text style={styles.benefitText}>
                            ✨ {isHindi ? mantra.benefit.hi : mantra.benefit.en}
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FFD700" />
                            <Text style={styles.loadingText}>Loading Mantra...</Text>
                        </View>
                    ) : (
                        <View style={styles.controlsWrapper}>
                            {isBuffering && (
                                <Text style={styles.bufferingText}>Buffering...</Text>
                            )}
                            <View style={styles.mainControls}>
                                <TouchableOpacity style={styles.stopBtn} onPress={stopAudio}>
                                    <Ionicons name="stop" size={32} color="#FFF" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={40}
                                        color="#120E0A"
                                    />
                                </TouchableOpacity>

                                <View style={styles.timerContainer}>
                                    <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Reward Modal */}
            <Modal
                visible={showRewardModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRewardModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.rewardCard}>
                        <View style={styles.crownContainer}>
                            <Ionicons name="trophy" size={80} color="#FFD700" />
                        </View>

                        <Text style={styles.congratsTitle}>
                            {isHindi ? 'बधाई हो!' : 'Congratulations!'}
                        </Text>

                        <Text style={styles.rewardMsg}>
                            {isHindi
                                ? `आपने सफलतापूर्वक मंत्र श्रवण पूरा किया है और १० दिव्य सिक्के अर्जित किए हैं।`
                                : `You have successfully listened to this mantra and earned 10 Divya Coins.`}
                        </Text>

                        <View style={styles.coinBadge}>
                            <Image
                                source={require('../assets/images/coins/gold_coins.png')}
                                style={styles.coinIcon}
                            />
                            <Text style={styles.coinText}>+10 Divya Coins</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.shareButton}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-social" size={24} color="#FFF" />
                                <Text style={styles.shareText}>{isHindi ? 'साझा करें' : 'Share'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => {
                                    setShowRewardModal(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={styles.closeBtnText}>{isHindi ? 'बंद करें' : 'Close'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Exit Support Modal */}
            <Modal
                transparent={true}
                visible={showSupportModal}
                animationType="fade"
                onRequestClose={() => setShowSupportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.devotionalCard}>
                        <View style={styles.spiritualIconBox}>
                            <Ionicons name="heart-circle" size={60} color="#FFD700" />
                        </View>

                        <Text style={styles.modalTitle}>
                            {isHindi ? 'शुभ विदाई' : 'Sacred Farewell'}
                        </Text>

                        <Text style={styles.devotionalText}>
                            {isHindi
                                ? 'प्रिय भक्त, यदि आपको मंत्र सुनना और हमारा कार्य पसंद आ रहा है, तो कृपया एक विज्ञापन देखकर हमारा सहयोग करें।'
                                : 'Dear Devotee, if you like listening to mantras or our work, please support us by watching a short ad.'}
                        </Text>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.supportBtn}
                                onPress={handleExitWithAd}
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFA000']}
                                    style={styles.btnGradient}
                                >
                                    <Ionicons name="videocam" size={20} color="#000" />
                                    <Text style={styles.supportBtnText}>
                                        {isHindi ? 'सहयोग करें' : 'Support'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={handleExitDirectly}
                            >
                                <Text style={styles.cancelBtnText}>
                                    {isHindi ? 'वापस जाएं' : 'Back'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Banner Ad placement (Sticky Bottom) */}
            <View style={styles.adContainer}>
                <BannerAd
                    key={`ad-mantra-${adIndex}`}
                    unitId={BANNER_AD_IDS[adIndex]}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>
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
        backgroundColor: '#1A120B'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    backButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 30
    },
    imageContainer: {
        width: 300,
        height: 300,
        borderRadius: 150,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFD700',
        elevation: 10,
        shadowColor: '#FFD700',
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    godImage: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    sanskritText: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'serif'
    },
    titleText: {
        color: '#BCAAA4',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20
    },
    benefitBox: {
        backgroundColor: '#1A120B',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3E2723'
    },
    benefitText: {
        color: '#FFCC80',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    controlsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#FFD700',
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold'
    },
    controlsWrapper: {
        alignItems: 'center',
        width: '100%'
    },
    bufferingText: {
        color: '#FFD700',
        fontSize: 12,
        marginBottom: 10,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    playBtn: {
        backgroundColor: '#FFD700',
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30,
        elevation: 5
    },
    stopBtn: {
        backgroundColor: '#C62828',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3
    },
    timerContainer: {
        width: 60,
        alignItems: 'flex-start'
    },
    timerText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace'
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    rewardCard: {
        backgroundColor: '#1A120B',
        width: '90%',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        elevation: 20,
        shadowColor: '#FFD700',
        shadowOpacity: 0.5,
        shadowRadius: 20
    },
    crownContainer: {
        marginBottom: 20,
        transform: [{ scale: 1.2 }]
    },
    congratsTitle: {
        color: '#FFD700',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'serif'
    },
    rewardMsg: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 25,
        opacity: 0.9
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        marginBottom: 30
    },
    coinIcon: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    coinText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold'
    },
    modalButtons: {
        width: '100%',
        gap: 15
    },
    shareButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF', // Standard Share Blue
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    shareText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    closeBtn: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3E2723',
        alignItems: 'center',
        justifyContent: 'center'
    },
    closeBtnText: {
        color: '#BCAAA4',
        fontSize: 16,
        fontWeight: '600'
    },
    // Modal Enhancements
    modalButtonRow: {
        width: '100%',
        gap: 12
    },
    supportBtn: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    supportBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelBtn: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cancelBtnText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: 'bold',
    },
    spiritualIconBox: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15,
        fontFamily: 'serif'
    },
    devotionalText: {
        color: '#EFEBE9',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    devotionalCard: {
        backgroundColor: '#1A120B',
        width: '90%',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#120E0A',
        borderTopWidth: 1,
        borderTopColor: '#3E2723',
    },
});

export default MantraPlayerScreen;

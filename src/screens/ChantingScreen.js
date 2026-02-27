import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { loadUserCoins, saveUserCoins } from '../utils/samagri_helpers';

const { width, height } = Dimensions.get('window');

// --- Assets ---
const FLOWER_IMAGES = [
    require('../assets/images/flower1.png'),
    require('../assets/images/flower2.png'),
    require('../assets/images/flower3.png')
];

// --- Falling Flower Component ---
const FallingFlower = ({ index, onComplete }) => {
    const [config] = useState(() => ({
        x: Math.random() * width,
        delay: Math.random() * 2000,
        duration: 3000 + Math.random() * 2000,
        imageSource: FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)]
    }));

    const translateY = useSharedValue(-50);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0.8);

    useEffect(() => {
        translateY.value = withDelay(
            config.delay,
            withTiming(height, { duration: config.duration, easing: Easing.linear }, (finished) => {
                if (finished) runOnJS(onComplete)(index);
            })
        );
        rotate.value = withDelay(
            config.delay,
            withRepeat(withTiming(360, { duration: 2000 }), -1)
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: config.x },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.Image
            source={config.imageSource}
            style={[styles.flower, style]}
            resizeMode="contain"
        />
    );
};

// --- Virtual Mala (108 Beads Ring) ---
const VirtualMala = ({ count, target }) => {
    const totalBeads = target || 108;
    const beads = Array.from({ length: totalBeads }, (_, i) => i);
    const radius = width * 0.42;
    const centerX = width / 2;
    const centerY = width / 2;

    return (
        <View style={styles.malaContainer}>
            {beads.map((i) => {
                const angleDeg = (i * (360 / totalBeads)) - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const x = centerX + radius * Math.cos(angleRad);
                const y = centerY + radius * Math.sin(angleRad);

                const isCompleted = i < count;
                const isCurrent = i === count;

                return (
                    <View
                        key={i}
                        style={[
                            styles.bead,
                            {
                                left: x - 3,
                                top: y - 3,
                                backgroundColor: isCurrent ? '#FFD700' : (isCompleted ? '#E65100' : 'rgba(141, 110, 99, 0.3)'),
                                transform: [{ scale: isCurrent ? 1.5 : 1 }],
                                zIndex: isCurrent ? 10 : 1
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};


const TRANSLATIONS = {
    en: {
        completed: 'Chanting Completed!',
        wellDone: 'Well done! You have completed',
        rounds: 'rounds.',
        reset: 'Reset',
        tapToCount: 'Tap to Count'
    },
    hi: {
        completed: 'Jaap पूर्ण हुआ!',
        wellDone: 'बहुत बढ़िया! आपने पूरा कर लिया है',
        rounds: 'माला।',
        reset: 'रीसेट',
        tapToCount: 'गिनती के लिए टैप करें'
    }
};

const ChantingScreen = ({ route, navigation }) => {
    const { mantra } = route.params;
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    const [count, setCount] = useState(0);
    // Use target from route params if provided, else fallback to mantra.count
    const target = route.params?.targetCount || mantra.count || 108;

    // Audio State: 'speak' | 'mute'
    const [flowers, setFlowers] = useState([]);
    const [showRewardModal, setShowRewardModal] = useState(false);

    const scale = useSharedValue(1);
    const rippleOpacity = useSharedValue(0);
    const rippleScale = useSharedValue(0);

    const addFlower = () => {
        if (Math.random() > 0.7) {
            const id = Date.now() + Math.random();
            setFlowers(prev => [...prev, { id }]);
        }
    };
    const removeFlower = (id) => {
        setFlowers(prev => prev.filter(f => f.id !== id));
    };

    const handlePress = async () => {
        if (count >= target) return;

        const newCount = count + 1;
        setCount(newCount);
        addFlower();

        // 1. Vibration
        Vibration.vibrate(50);

        // Milestone Haptic (Every 27 beads - Quarter Mala)
        if (newCount % 27 === 0 && newCount !== target) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        // 2. Animate Button 
        scale.value = withSequence(
            withTiming(0.9, { duration: 50 }),
            withSpring(1, { damping: 10 })
        );

        // 3. Ripple Effect
        rippleScale.value = 0;
        rippleOpacity.value = 0.5;
        rippleScale.value = withTiming(1.5, { duration: 400 });
        rippleOpacity.value = withTiming(0, { duration: 400 });

        // 4. Check Completion
        if (newCount === target) {
            handleCompletion();
        }
    };

    const handleCompletion = async () => {
        // Award Coins
        const currentCoins = await loadUserCoins();
        await saveUserCoins(currentCoins + 5);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowRewardModal(true);
    };

    const handleShare = async () => {
        try {
            const message = isHindi
                ? `मैंने अभी ${mantra.title} का ${target} बार जाप पूरा किया और 5 दिव्य सिक्के कमाए! 🙏✨ आप भी आध्यात्मिक शांति के लिए इस ऐप को डाउनलोड करें: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`
                : `I just completed chanting ${mantra.title} ${target} times and earned 5 Divya Coins! 🙏✨ Join me for a spiritual journey: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleReset = () => {
        Alert.alert(t.reset, "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => setCount(0) }
        ]);
    };

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rippleScale.value }],
        opacity: rippleOpacity.value
    }));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Falling Flowers Layer */}
            {flowers.map(f => (
                <FallingFlower key={f.id} index={f.id} onComplete={() => removeFlower(f.id)} />
            ))}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isHindi ? 'जाप' : 'Chanting'}</Text>

                <TouchableOpacity onPress={handleReset}>
                    <Ionicons name="refresh" size={24} color="#BCAAA4" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>

                {/* Top Section: Mantra Info */}
                <View style={styles.mantraInfo}>
                    <Text style={styles.sanskritText}>{mantra.sans}</Text>
                    {!isHindi && <Text style={styles.titleText}>{mantra.title}</Text>}
                </View>

                {/* Middle: Virtual Mala & Counter */}
                <View style={styles.malaSection}>
                    {/* Ring */}
                    <VirtualMala count={count} target={target} />

                    {/* Center Button */}
                    <TouchableWithoutFeedback onPress={handlePress}>
                        <View style={styles.buttonWrapper}>
                            <View style={styles.rippleContainer}>
                                <Animated.View style={[styles.ripple, rippleStyle]} />
                            </View>

                            <Animated.View style={[styles.mainButton, buttonStyle]}>
                                <Text style={styles.countBig}>{count}</Text>
                                <Text style={styles.targetSmall}>/ {target}</Text>
                                <Text style={styles.tapText}>{t.tapToCount}</Text>
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
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
                            {isHindi ? 'जाप सफल हुआ!' : 'Chanting Successful!'}
                        </Text>

                        <Text style={styles.rewardMsg}>
                            {isHindi
                                ? `आपने सफलतापूर्वक ${target} बार जाप पूरा किया है और ५ दिव्य सिक्के अर्जित किए हैं।`
                                : `You have successfully completed ${target} chants and earned 5 Divya Coins.`}
                        </Text>

                        <View style={styles.coinBadge}>
                            <Image
                                source={require('../assets/images/coins/gold_coins.png')}
                                style={styles.coinIcon}
                            />
                            <Text style={styles.coinText}>+5 Divya Coins</Text>
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
        backgroundColor: '#1A120B',
        zIndex: 10
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20
    },
    mantraInfo: {
        alignItems: 'center',
        opacity: 0.9,
        paddingHorizontal: 20,
        zIndex: 5
    },
    sanskritText: {
        color: '#FFB74D',
        fontSize: 22,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5
    },
    titleText: {
        color: '#B0BEC5',
        fontSize: 14,
        textAlign: 'center',
    },
    malaSection: {
        alignItems: 'center',
        justifyContent: 'center',
        height: width * 0.9, // Square area for circle
        width: width,
    },
    malaContainer: {
        position: 'absolute',
        width: width,
        height: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bead: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    buttonWrapper: { // Center Button Container
        alignItems: 'center',
        justifyContent: 'center',
        width: 220,
        height: 220,
    },
    mainButton: {
        width: 200, // Increased size
        height: 200,
        borderRadius: 100,
        backgroundColor: '#BF360C',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFD700',
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 20
    },
    rippleContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        position: 'absolute'
    },
    countBig: {
        fontSize: 40,
        color: '#FFF',
        fontWeight: 'bold',
    },
    targetSmall: {
        fontSize: 14,
        color: '#FFCC80',
        opacity: 0.8
    },
    tapText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 5,
        textTransform: 'uppercase'
    },
    flower: {
        position: 'absolute',
        width: 30, // Small flowers
        height: 30,
        zIndex: 0
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
        backgroundColor: '#007AFF',
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
    }
});

export default ChantingScreen;

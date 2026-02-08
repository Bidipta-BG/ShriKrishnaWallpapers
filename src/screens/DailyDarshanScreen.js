import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// --- Falling Flower Component ---
const FLOWER_IMAGES = [
    require('../assets/images/flower1.png'),
    require('../assets/images/flower2.png'),
    require('../assets/images/flower3.png')
];

const COIN_IMAGES = [
    require('../assets/images/coin1.png'),
    require('../assets/images/coin2.png')
];

// --- Dummy Music Data Removed (Moved to MantrasScreen)

const FLOWER_COUNT = 15;
const FallingFlower = ({ index, onComplete }) => {
    // Determine random properties ONCE on mount
    const [config] = useState(() => ({
        x: Math.random() * width,
        delay: Math.random() * 500, // Reduced delay (0-0.5s)
        duration: 4000 + Math.random() * 2000, // 4-6s fall duration
        // Pick random flower image once
        imageSource: FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)]
    }));

    // Use stable config values
    const randomX = config.x;
    const randomDelay = config.delay;
    const randomDuration = config.duration;
    const imageSource = config.imageSource;

    const translateY = useSharedValue(-50);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Target Y: Bottom Shelf area ~ (height - 190 range) - Moved UP by 30px
        // Add random variation to "pile" them naturally
        const targetY = height - 70 + (Math.random() * 20);

        translateY.value = withDelay(
            randomDelay,
            withSequence(
                // 1. Fall Down
                withTiming(targetY, { duration: randomDuration, easing: Easing.out(Easing.quad) }),
                // 2. "Settle" - stay there for a bit (5-8 seconds)
                withDelay(5000 + Math.random() * 3000,
                    // 3. Fade Out
                    withTiming(targetY + 20, { duration: 1000 }, (finished) => { // Slight drop + fade
                        if (finished) {
                            runOnJS(onComplete)(index);
                        }
                    })
                )
            )
        );

        // Match fade out opacity
        opacity.value = withDelay(
            randomDelay + randomDuration + 5000, // Wait for fall + settle time
            withTiming(0, { duration: 1000 })
        );

        rotate.value = withDelay(
            randomDelay,
            withRepeat(withTiming(360, { duration: 2000 }), -1)
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: randomX },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.Image
            source={imageSource}
            style={[styles.flower, style]}
            resizeMode="contain"
        />
    );
};

const FallingCoin = ({ index, onComplete }) => {
    // Determine random properties ONCE on mount
    const [config] = useState(() => ({
        x: Math.random() * width,
        delay: Math.random() * 500,
        duration: 3000 + Math.random() * 1500, // Coins fall slightly faster (3-4.5s)
        imageSource: COIN_IMAGES[Math.floor(Math.random() * COIN_IMAGES.length)]
    }));

    const translateY = useSharedValue(-50);
    const rotate = useSharedValue(0);

    const opacity = useSharedValue(1);

    useEffect(() => {
        const targetY = height - 70 + (Math.random() * 20);

        translateY.value = withDelay(
            config.delay,
            withSequence(
                withTiming(targetY, { duration: config.duration, easing: Easing.bounce }, (finished) => {
                    // removing onComplete here, move to end of lifecycle
                }),
                withDelay(5000 + Math.random() * 3000,
                    withTiming(targetY + 10, { duration: 1000 }, (finished) => {
                        if (finished) runOnJS(onComplete)(index);
                    })
                )
            )
        );

        opacity.value = withDelay(
            config.delay + config.duration + 5000,
            withTiming(0, { duration: 1000 })
        );

        rotate.value = withDelay(
            config.delay,
            withRepeat(withTiming(360, { duration: 1000 }), -1)
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: config.x },
            { translateY: translateY.value },
            { rotateY: `${rotate.value}deg` } // 3D spin for coins looks cool
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.Image
            source={config.imageSource}
            style={[styles.coin, style]}
            resizeMode="contain"
        />
    );
};

// --- Helper Components for the Icons ---
const SideIcon = ({ color, emoji, iconName, iconSize = 24, iconColor = "#fff", imageSource, label, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: color || 'rgba(0,0,0,0.4)' }]}>
                {imageSource ? (
                    <Image source={imageSource} style={{ width: 30, height: 30 }} resizeMode="contain" />
                ) : iconName ? (
                    <Ionicons name={iconName} size={iconSize} color={iconColor} />
                ) : (
                    <Text style={styles.iconEmoji}>{emoji}</Text>
                )}
            </View>
            {label && <Text style={styles.iconLabel}>{label}</Text>}
        </View>
    </TouchableOpacity>
);

// --- Dummy Translation Data (Simulating Backend) ---
const TRANSLATIONS = {
    en: {
        flowers: 'Flowers',
        coins: 'Coins',
        shankh: 'Shankh',
        more: 'More',
        slokas: 'Slokas',
        chanting: 'Chanting',
        share: 'Share',
        about: 'About',
        allImages: 'All Images',
        allMantras: 'All Mantras',
        download: 'Download',
        saveImage: 'Save Image',
        setHomeWallpaper: 'Set Home Screen',
        setLockWallpaper: 'Set Lock Screen',
        cancel: 'Cancel',
        alarm: 'Alarm',
        scheduleDarshan: 'Daily Darshan',
        play: 'Play',
        pause: 'Pause',
        repeat: 'repeat',
    },
    hi: {
        flowers: 'पुष्प',
        coins: 'मुद्रा',
        shankh: 'शंख',
        more: 'अधिक',
        slokas: 'श्लोक',
        chanting: 'जाप',
        share: 'साझा करें',
        about: 'मेरे बारे में',
        allImages: 'सभी चित्र',
        allMantras: 'सभी मंत्र/गीत',
        cancel: 'रद्द करें',
        alarm: 'अलार्म',
        scheduleDarshan: 'दैनिक दर्शन',
        play: 'चलाएं',
        pause: 'रोकें',
        repeat: 'दोहराएं',
    },
    // Add other languages as needed, defaulting to English for now
};

const DailyDarshanScreen = ({ navigation }) => {
    const { language, isUIReady } = useLanguage();
    const insets = useSafeAreaInsets();
    const route = useRoute();

    const [backgroundImage, setBackgroundImage] = useState(Image.resolveAssetSource(require('../assets/images/default_darshan.jpg')).uri);

    // Load saved background whenever screen gains focus
    useFocusEffect(
        useCallback(() => {
            const loadBackground = async () => {
                try {
                    const saved = await AsyncStorage.getItem('saved_background_image');
                    if (saved) {
                        setBackgroundImage(saved);
                    } else {
                        // Fallback to local bundled image
                        setBackgroundImage(Image.resolveAssetSource(require('../assets/images/default_darshan.jpg')).uri);
                    }
                } catch (error) {
                    console.log('Error loading background:', error);
                }
            };
            loadBackground();
        }, [])
    );

    // Get translations for current language or fallback to English
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    // Apply strict safe area logic to critical containers
    const bellContainerStyle = {
        top: Math.max(insets.top, 10), // Ensure at least 20px, but more if notch exists
    };

    const bottomSectionStyle = {
        paddingBottom: Math.max(insets.bottom, 10), // Ensure bottom nav bar space
    };

    // --- Daily Streak Logic ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [streak, setStreak] = useState(1);
    const [challengeGoal, setChallengeGoal] = useState(100);
    const [streakDataLoaded, setStreakDataLoaded] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (isUIReady) {
                checkDailyStreak();
            }
        }, [isUIReady])
    );

    const checkDailyStreak = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const lastDate = await AsyncStorage.getItem('lastDarshanDate');
            const storedStreak = await AsyncStorage.getItem('currentStreak');
            const storedGoal = await AsyncStorage.getItem('challenge_days');

            if (storedGoal) setChallengeGoal(parseInt(storedGoal));

            let newStreak = 1;
            let shouldAutoPlay = false;

            if (!lastDate) {
                // First time ever
                newStreak = 1;
                shouldAutoPlay = true; // Maybe auto-play first time? User didn't specify, but "auto happen only for first time" implies new day
            } else if (lastDate === today) {
                // Already done today
                newStreak = parseInt(storedStreak) || 1;
                shouldAutoPlay = false;
            } else {
                // Check if it's consecutive (yesterday)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === yesterdayStr) {
                    // Consecutive day!
                    newStreak = (parseInt(storedStreak) || 1) + 1;
                    shouldAutoPlay = true;
                } else {
                    // Missed a day (Streak Broken)
                    newStreak = 1;
                    shouldAutoPlay = true; // New day, so perform Aarti
                }
            }

            setStreak(newStreak);
            setStreakDataLoaded(true);

            // Save new state if it changed (optimization: only if different or new day)
            if (lastDate !== today) {
                await AsyncStorage.setItem('lastDarshanDate', today);
                await AsyncStorage.setItem('currentStreak', newStreak.toString());
            }

            // Trigger Puja if needed
            // IMPORTANT: "happen only for the first time" -> meaning first time TODAY
            if (shouldAutoPlay) {
                console.log("Auto-playing Puja!");
                // Small delay to let screen mount/render before animation starts
                setTimeout(() => {
                    performAarti();
                }, 1000);
            }

        } catch (error) {
            console.error('Error checking streak:', error);
        }
    };

    // --- DEBUG: Reset Data for Testing ---
    const debugResetStreak = async () => {
        try {
            await AsyncStorage.removeItem('lastDarshanDate');
            await AsyncStorage.removeItem('currentStreak');
            setStreak(1);
            Alert.alert("Testing Mode", "Data Reset! \n\n1. Restart App -> Will count as Day 1 & Auto Play.\n2. Come back tomorrow -> Day 2.");
        } catch (e) {
            console.error(e);
        }
    };


    // --- Animations & Sound ---
    const bellRotation = useSharedValue(0);
    const diyaOpacity = useSharedValue(1);
    const soundRef = useRef(null);
    const [isRinging, setIsRinging] = useState(false);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const ringBell = async () => {
        if (isRinging) return;
        setIsRinging(true);

        try {
            // 1. Start Sound
            // Using local file at src/assets/sounds/bell_sound.mp3
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/bell-sound.mp3'),
                { shouldPlay: true, isLooping: true }
            );
            soundRef.current = sound;

            // 2. Start Animation
            bellRotation.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-15, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinite loop
                true // Auto-reverse
            );

            // 3. Stop after Aarti duration (~13.5s)
            setTimeout(async () => {
                // Stop Animation
                cancelAnimation(bellRotation);
                bellRotation.value = withTiming(0, { duration: 500 });

                // Stop Sound
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                    await soundRef.current.unloadAsync();
                    soundRef.current = null;
                }
                setIsRinging(false);
            }, 13500);

        } catch (error) {
            console.log('Error playing sound:', error);
            setIsRinging(false);
        }
    };

    // --- Shankh Sound ---
    const shankhSoundRef = useRef(null);
    const [isShankhPlaying, setIsShankhPlaying] = useState(false);

    // Cleanup shankh on unmount
    useEffect(() => {
        return () => {
            if (shankhSoundRef.current) {
                shankhSoundRef.current.unloadAsync();
            }
        };
    }, []);

    const playShankh = async () => {
        if (isShankhPlaying) {
            // If already playing, stop it
            if (shankhSoundRef.current) {
                await shankhSoundRef.current.stopAsync();
                await shankhSoundRef.current.unloadAsync();
                shankhSoundRef.current = null;
            }
            setIsShankhPlaying(false);
            return;
        }

        setIsShankhPlaying(true);
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/shank-sound.mp3'),
                { shouldPlay: true }
            );
            shankhSoundRef.current = sound;

            // Auto-reset state when playback finishes
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsShankhPlaying(false);
                    sound.unloadAsync(); // Cleanup
                }
            });

        } catch (error) {
            console.log('Error playing Shankh:', error);
            setIsShankhPlaying(false);
        }
    };

    useEffect(() => {
        // Diya Flickering (Always On)
        diyaOpacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    const bellStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: -40 },
            { rotate: `${bellRotation.value}deg` },
            { translateY: 40 }
        ]
    }));

    // --- Aarti Animation (Diya) ---
    const aartiRotation = useSharedValue(0);
    const aartiScale = useSharedValue(1);
    const [isAartiActive, setIsAartiActive] = useState(false);
    const [rewardPoints, setRewardPoints] = useState(0); // For Punya Coins demo


    const handleSetAlarm = () => {
        Alert.alert("Set Alarm", "Alarm feature is coming soon!");
    };

    // --- Download & Share Logic ---

    // Helper: Download Image to Local Cache
    const downloadToCache = async () => {
        try {
            const fileUri = `${FileSystem.cacheDirectory}darshan_image.jpg`;
            const { uri } = await FileSystem.downloadAsync(backgroundImage, fileUri);
            return uri;
        } catch (e) {
            console.error(e);
            return null;
        }
    }





    const performAarti = () => {
        if (isAartiActive) return;
        setIsAartiActive(true);

        // --- Grand Puja Mode ---
        // Trigger all other effects
        playShankh();
        ringBell(); // Add Bells to the Puja!
        triggerFlowerShower();
        triggerCoinShower();

        // 1. Scale Up slightly
        aartiScale.value = withTiming(1.5, { duration: 500 });

        // 2. Start Circular Motion (0 -> 360 * 4 rounds)
        // Speed check: 3 rounds took 10s (3.33s/round).
        // 4 rounds should take ~13.33s to keep same speed.
        aartiRotation.value = withTiming(360 * 4, {
            duration: 13333,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                // Instantly reset rotation (since 360*4 == 0 degrees)
                aartiRotation.value = 0;

                // Animate scale back down
                aartiScale.value = withTiming(1, { duration: 1000 });
                runOnJS(setIsAartiActive)(false);
            }
        });
    };

    const diyaStyle = useAnimatedStyle(() => {
        // Circular Path Logic
        // Radius of the circle (covers center of screen)
        const radius = 120;

        // Convert rotation (degrees) to radians
        const angleRad = (aartiRotation.value * Math.PI) / 180;

        if (aartiRotation.value === 0) {
            return {
                opacity: diyaOpacity.value,
                transform: [{ scale: 1 }]
            };
        }

        return {
            opacity: 1, // Full opacity during Aarti
            transform: [
                { scale: aartiScale.value },
                { translateX: radius * Math.sin(angleRad) },
                { translateY: -radius * (1 - Math.cos(angleRad)) - (aartiScale.value - 1) * 120 - 40 }
            ]
        };
    });

    // --- Flower Shower State ---
    const [activeFlowers, setActiveFlowers] = useState([]);
    const showerIntervalRef = useRef(null);

    const triggerFlowerShower = () => {
        // Prevent multiple intervals
        if (showerIntervalRef.current) return;

        // Function to add a small batch of flowers
        const addBatch = () => {
            const newFlowers = Array.from({ length: 2 }, (_, i) => ({
                id: `${Date.now()}-${i}-${Math.random()}`, // Ensure unique ID
            }));
            setActiveFlowers(prev => [...prev, ...newFlowers]);
        };

        // Start immediate batch
        addBatch();

        // Continue adding batches every 300ms for 10 seconds (Continuous flow)
        showerIntervalRef.current = setInterval(addBatch, 300);

        // Stop generating after 10 seconds
        setTimeout(() => {
            if (showerIntervalRef.current) {
                clearInterval(showerIntervalRef.current);
                showerIntervalRef.current = null;
            }
        }, 10000);
    };

    const removeFlower = (index) => {
        // No-op: handled by batch cleanup mostly, or let them fall off screen
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (showerIntervalRef.current) {
                clearInterval(showerIntervalRef.current);
            }
        };
    }, []);

    // Clear flowers state completely after 15s (10s generation + 5s fall time)
    useEffect(() => {
        if (activeFlowers.length > 0) {
            const timer = setTimeout(() => {
                // Only clear if no new generation (simple check)
                if (!showerIntervalRef.current) {
                    setActiveFlowers([]);
                }
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [activeFlowers]);

    // --- Coin Shower State ---
    const [activeCoins, setActiveCoins] = useState([]);
    const coinIntervalRef = useRef(null);

    const triggerCoinShower = () => {
        if (coinIntervalRef.current) return;

        // ... existing coin logic ...
        const addBatch = () => {
            const newCoins = Array.from({ length: 2 }, (_, i) => ({
                id: `${Date.now()}-${i}-${Math.random()}`,
            }));
            setActiveCoins(prev => [...prev, ...newCoins]);
        };

        addBatch();
        coinIntervalRef.current = setInterval(addBatch, 300);

        setTimeout(() => {
            if (coinIntervalRef.current) {
                clearInterval(coinIntervalRef.current);
                coinIntervalRef.current = null;
            }
        }, 10000);
    };

    const removeCoin = (index) => { };

    useEffect(() => {
        return () => {
            if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (activeCoins.length > 0) {
            const timer = setTimeout(() => {
                if (!coinIntervalRef.current) setActiveCoins([]);
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [activeCoins]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Falling Flowers Layer */}
            {activeFlowers.map((flower, index) => (
                <FallingFlower key={flower.id} index={index} onComplete={removeFlower} />
            ))}

            {/* Falling Coins Layer */}
            {activeCoins.map((coin, index) => (
                <FallingCoin key={coin.id} index={index} onComplete={removeCoin} />
            ))}

            {/* 1. Background Wallpaper (Replaces Gradient & Center Content) */}
            <Image
                source={{ uri: backgroundImage }}
                style={styles.background}
                resizeMode="cover"
            />

            {/* 2. Top Layer: Hanging Bells */}
            {/* User requested to move bells UP. Removed safe area constraint to allow them to go higher */}
            <View style={[styles.bellsContainer, { top: insets.top - 25 }]}>
                <TouchableOpacity onPress={ringBell} activeOpacity={0.8}>
                    <Animated.View style={[styles.bellWrapper, styles.bellLeft, bellStyle]}>
                        <View style={styles.bellString} />
                        <Text style={styles.bellEmoji}>🔔</Text>
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ringBell} activeOpacity={0.8}>
                    <Animated.View style={[styles.bellWrapper, styles.bellRight, bellStyle]}>
                        <View style={styles.bellString} />
                        <Text style={styles.bellEmoji}>🔔</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* ... */}



            {/* 4. Side Icons Layer */}
            <View style={styles.sidesContainer}>
                {/* Left Column - 3 buttons */}
                <View style={styles.leftColumn}>
                    <SideIcon
                        iconName="flower-outline"
                        label={t.flowers || 'Flowers'}
                        onPress={triggerFlowerShower}
                    />

                    <SideIcon
                        iconName="cash-outline"
                        label={t.coins || 'Coins'}
                        onPress={triggerCoinShower}
                    />
                    <SideIcon
                        imageSource={require('../assets/images/shankh_icon.png')}
                        label={t.shankh}
                        onPress={playShankh}
                    />
                </View>

                {/* Right Column - 3 buttons */}
                <View style={styles.rightColumn}>
                    <SideIcon
                        iconName="book-outline"
                        label={t.slokas}
                        onPress={() => navigation.navigate('Slokas')}
                    />
                    <SideIcon
                        iconName="radio-button-on-outline"
                        label={t.chanting}
                        onPress={() => navigation.navigate('MantraSelection')}
                    />
                    <SideIcon
                        iconName="information-circle-outline"
                        label={t.about || 'About'}
                        onPress={() => Alert.alert("Account Details", "This feature is coming soon!")}
                    />
                </View>
            </View>

            {/* 5. New Tech Bottom Navigation */}
            <View style={styles.bottomNavContainer}>
                {/* 5.1 Middle Bar (Restored: Streak & Quick Links) */}
                <View style={styles.streakBar}>
                    {/* Streak Counter (Now on the Left) */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('ScheduleDarshan')}
                        style={{ alignItems: 'flex-start', minWidth: 100, paddingLeft: 15 }}
                    >
                        <Text style={{ fontSize: 16, color: '#000', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }}>
                            {language === 'hi' ? `दिन ${streak}/${challengeGoal}` : `Day ${streak}/${challengeGoal}`}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#2b1803', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 0.5 }}>
                            {language === 'hi' ? 'चैलेंज' : 'Challenge'}
                        </Text>
                    </TouchableOpacity>

                    {/* Center (Now Blank) */}
                    <View style={{ flex: 1 }} />

                    {/* Punya Points (On the Right) */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('ScheduleDarshan')}
                        style={{ alignItems: 'flex-end', minWidth: 100, paddingRight: 15 }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 16, color: '#000', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }}>
                                {streak * 50}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#2b1803', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 0.5 }}>
                            {language === 'hi' ? 'पुण्य मुद्रा' : 'Punya Coins'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Bar (Subtle tech line) */}
                <View style={styles.techProgressBar} />

                <View style={styles.navBar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Gallery')}>
                        <Ionicons name="images-outline" size={24} color="#FFF" />
                        <Text style={styles.navLabel}>Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Reels')}>
                        <Ionicons name="videocam-outline" size={24} color="#FFF" />
                        <Text style={styles.navLabel}>Reels</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => { /* Already on Puja */ }}>
                        <View style={styles.pujaActiveIndicator} />
                        <Ionicons name="flower-outline" size={26} color="#00E676" />
                        <Text style={[styles.navLabel, { color: '#00E676' }]}>Puja</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Generate')}>
                        <Ionicons name="color-palette-outline" size={24} color="#FFF" />
                        <Text style={styles.navLabel}>Generate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Saved')}>
                        <Ionicons name="bookmark-outline" size={24} color="#FFF" />
                        <Text style={styles.navLabel}>Saved</Text>
                    </TouchableOpacity>
                </View>

                {/* Safe Area Spacer - Moved to bottom of container */}
                <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#000' }} />
            </View>

            {/* Central Big Diya Layered Above EVERYTING - Now outside bottomNav to avoid pushing layout */}
            <View style={styles.centerThaliContainer} pointerEvents="box-none">
                <TouchableOpacity onPress={performAarti} activeOpacity={0.8}>
                    <Animated.Image
                        source={require('../assets/images/my_diya.png')}
                        style={[styles.thaliImage, diyaStyle]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

        </View >
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
    // --- Top Bells ---
    bellsContainer: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30, // Increased to move inswards x-axis
        zIndex: 20,
    },
    bellWrapper: {
        alignItems: 'center',
    },
    bellString: {
        width: 2,
        height: 40,
        backgroundColor: '#FFD700',
    },
    bellEmoji: {
        fontSize: 50, // Increased size
        marginTop: -5,
        color: '#FFD700', // Gold attempt via text
    },
    // --- Side Icons ---
    sidesContainer: {
        position: 'absolute',
        bottom: 145, // Increased to move icons up so labels don't hide behind tab bar
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        zIndex: 10,
    },
    leftColumn: {
        gap: 15, // Spacing between icons
    },
    rightColumn: {
        gap: 15,
    },
    iconWrapper: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',

        // Visibility Enhancements
        backgroundColor: 'rgba(0,0,0,0.5)', // Darker background
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.9)', // Bright crisp border

        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconEmoji: {
        fontSize: 24,
    },
    iconLabel: {
        color: '#fff',
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold',
    },

    thaliImage: {
        width: 120,
        height: 120,
    },
    centerThaliContainer: {
        position: 'absolute',
        bottom: 33,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
    },
    // --- Bottom Section Redesign ---
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
    },
    techProgressBar: {
        width: '100%',
        height: 2,
        backgroundColor: '#00E676', // Techy Green glow
        shadowColor: '#00E676',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 10,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 6,
        backgroundColor: '#000', // Black background moved here
    },
    // --- Restored Styles for Middle Bar ---
    streakBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Even more transparent
    },
    streakItem: {
        color: '#5e3a0e', // Dark brown
        fontWeight: 'bold',
        fontSize: 16,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navLabel: {
        color: '#FFF',
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    pujaActiveIndicator: {
        position: 'absolute',
        top: -10,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#00E676',
    },
    flower: {
        position: 'absolute',
        top: -50,
        width: 40,
        height: 40,
        zIndex: 100,
    },
    coin: {
        position: 'absolute',
        top: -50,
        width: 35,
        height: 35,
        zIndex: 100,
    },
    // --- Modal Styles ---
    modalOverlay: {
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    modalButton: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginVertical: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    cancelButton: {
        marginTop: 15,
        backgroundColor: '#ffdddd',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#d9534f',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // --- Playlist Styles ---
    playlistContent: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 10,
    },
    trackItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activeTrack: {
        backgroundColor: '#FFF8E1',
        borderRadius: 5,
        paddingHorizontal: 5,
    },
    trackTitle: {
        fontSize: 16,
        color: '#333',
    },
    activeTrackText: {
        color: '#CD9730', // Gold/DarkYellow
        fontWeight: 'bold',
    },
    // --- Gallery Styles ---
    galleryContainer: {
        flex: 1,
        width: '100%',
        paddingTop: 10,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    galleryTabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    galleryTabItem: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    galleryTabActive: {
        backgroundColor: '#CD9730',
    },
    galleryTabText: {
        color: '#555',
        fontWeight: '600',
    },
    galleryTabTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    galleryGrid: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    galleryImageContainer: {
        flex: 1,
        margin: 5,
        aspectRatio: 1, // Square images
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        backgroundColor: '#fff',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    tabItemActive: {
        color: '#CD9730', // Highlight active bottom tab
        textDecorationLine: 'underline',
    },

});

export default DailyDarshanScreen;

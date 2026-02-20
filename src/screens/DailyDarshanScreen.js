import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import GarlandMala from '../components/GarlandMala';
import PrasadDisplay from '../components/PrasadDisplay';
import { useLanguage } from '../context/LanguageContext';
import {
    ITEM_ICONS,
    loadSelectedPujaItems,
    loadUnlockedItems
} from '../utils/samagri_helpers';

const { width, height } = Dimensions.get('window');
const PUJA_DURATION = 18000; // 18 seconds for a complete experience

// --- Falling Flower Component ---
// ONLY default unlocked flowers for fallback
const FLOWER_IMAGES = [
    require('../assets/images/flowers_leafs/marigold.png')
];

// ONLY default unlocked coins for fallback
const COIN_IMAGES = [
    require('../assets/images/coins/normal_coins.png')
];

// --- Dummy Music Data Removed (Moved to MantrasScreen)
const INSTRUMENT_SOUNDS = {
    's1': require('../assets/sounds/shank-sound.mp3'),
    's2': require('../assets/sounds/bell_sound2.mp3'),
    's3': require('../assets/sounds/majira_sound.mp3'),
    's4': require('../assets/sounds/drum_sound.mp3'),
};

const FLOWER_COUNT = 15;
const FallingFlower = ({ index, onComplete, imageSource }) => {
    // Determine random properties ONCE on mount
    const [config] = useState(() => ({
        x: Math.random() * width,
        delay: Math.random() * 500, // Reduced delay (0-0.5s)
        duration: 4000 + Math.random() * 2000, // 4-6s fall duration
    }));

    // Use stable config values
    const randomX = config.x;
    const randomDelay = config.delay;
    const randomDuration = config.duration;

    const translateY = useSharedValue(-50);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Target Y: Bottom Shelf area ~ (height - 190 range) - Moved UP by 30px
        // Add random variation to "pile" them naturally
        const targetY = height - 160 + (Math.random() * 20);

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

    if (!imageSource) return null;

    return (
        <Animated.Image
            source={imageSource}
            style={[styles.flower, style]}
            resizeMode="contain"
        />
    );
};

const FallingCoin = ({ index, onComplete, imageSource }) => {
    // Determine random properties ONCE on mount
    const [config] = useState(() => ({
        x: Math.random() * width,
        delay: Math.random() * 500,
        duration: 3000 + Math.random() * 1500, // Coins fall slightly faster (3-4.5s)
    }));

    const translateY = useSharedValue(-50);
    const rotate = useSharedValue(0);

    const opacity = useSharedValue(1);

    useEffect(() => {
        const targetY = height - 160 + (Math.random() * 20);

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

    if (!imageSource) return null;

    return (
        <Animated.Image
            source={imageSource}
            style={[styles.coin, style]}
            resizeMode="contain"
        />
    );
};

// --- Helper Components for the Icons ---
const SideIcon = ({ color, emoji, iconName, iconSize = 24, iconColor = "#fff", imageSource, label, onPress, disabled, active }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={disabled ? 1 : 0.7}>
        <View style={[styles.iconWrapper, disabled && { opacity: 0.5 }]}>
            <View style={[
                styles.iconCircle,
                { backgroundColor: color || 'rgba(0,0,0,0.4)' },
                active && { borderColor: '#9c6ce6', borderWidth: 2 }
            ]}>
                {imageSource && imageSource !== null ? (
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
        bell: 'Bell',
        majira: 'Majira',
        drum: 'Drum',
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
        shieldTitle: 'Sadhana Saved! 🙏',
        shieldMsg: 'You missed your Puja yesterday, but your Raksha Kavach (Shield) protected your progress. Shri Krishna is waiting for you!',
        ok: 'Pranam',
    },
    hi: {
        flowers: 'पुष्प',
        coins: 'मुद्रा',
        shankh: 'शंख',
        bell: 'घंटी',
        majira: 'मंजीरा',
        drum: 'नगाड़ा',
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
        shieldTitle: 'साधना सुरक्षित है! 🙏',
        shieldMsg: 'कल आप प्रभु की सेवा में उपस्थित नहीं हो सके, परंतु आपके "रक्षा कवच" ने आपकी प्रगति को सुरक्षित रखा है। प्रभु आपकी प्रतीक्षा कर रहे हैं!',
        ok: 'प्रणाम',
    },
    // Add other languages as needed, defaulting to English for now
};

const DailyDarshanScreen = ({ navigation }) => {
    const { language, isUIReady } = useLanguage();
    const insets = useSafeAreaInsets();
    const route = useRoute();

    // --- Active Ceremony & Animation States ---
    const [isAartiActive, setIsAartiActive] = useState(false);
    const [isInstrumentPlaying, setIsInstrumentPlaying] = useState(false);
    const [isRinging, setIsRinging] = useState(false);
    const [isPrasadVisible, setIsPrasadVisible] = useState(false);
    const [isDhupVisible, setIsDhupVisible] = useState(false);
    const [isFlowerShowerActive, setIsFlowerShowerActive] = useState(false);
    const [isCoinShowerActive, setIsCoinShowerActive] = useState(false);
    const [isGarlandVisible, setIsGarlandVisible] = useState(false);

    // Master Interaction Lock
    const isInteractionDisabled = isAartiActive || isInstrumentPlaying || isPrasadVisible || isDhupVisible || isFlowerShowerActive || isCoinShowerActive || isRinging;

    // --- Samagri Selections for Animations ---
    // Initialize with defaults to avoid empty shower before fetch
    const [selectedFlowerIcons, setSelectedFlowerIcons] = useState([require('../assets/images/flowers_leafs/marigold.png')]);
    const [selectedCoinIcons, setSelectedCoinIcons] = useState([require('../assets/images/coins/normal_coins.png')]);
    const [selectedPrasadIcons, setSelectedPrasadIcons] = useState([]); // Array of prasad image sources
    const [selectedDhupIcon, setSelectedDhupIcon] = useState(null);
    const [selectedThaliIcon, setSelectedThaliIcon] = useState(require('../assets/images/my_diya.png'));
    const [selectedSoundId, setSelectedSoundId] = useState('s1');
    const [selectedSoundIcon, setSelectedSoundIcon] = useState(require('../assets/images/shankh_icon.png'));
    const [selectedGarlandIcon, setSelectedGarlandIcon] = useState(null);
    const dhupTimeoutRef = useRef(null);
    const prasadTimeoutRef = useRef(null);

    // Load user selections on focus
    useFocusEffect(
        useCallback(() => {
            const fetchSelections = async () => {
                const selected = await loadSelectedPujaItems();
                const unlocked = await loadUnlockedItems();

                const flowerIcons = (selected.flowers || [])
                    .filter(id => unlocked[id])
                    .map(id => ITEM_ICONS[id])
                    .filter(Boolean);
                setSelectedFlowerIcons(flowerIcons.length > 0 ? flowerIcons : [ITEM_ICONS['f1']]);

                const coinIcons = (selected.coins || [])
                    .filter(id => unlocked[id])
                    .map(id => ITEM_ICONS[id])
                    .filter(Boolean);
                setSelectedCoinIcons(coinIcons.length > 0 ? coinIcons : [ITEM_ICONS['c1']]);

                const garlandId = selected.garlands;
                if (garlandId && unlocked[garlandId]) {
                    setSelectedGarlandIcon(ITEM_ICONS[garlandId]);
                } else {
                    setSelectedGarlandIcon(null);
                }

                const prasadIcons = (selected.samagri || [])
                    .filter(id => unlocked[id])
                    .map(id => ITEM_ICONS[id])
                    .filter(Boolean);
                setSelectedPrasadIcons(prasadIcons);

                // Map Dhup/Diya ID, checking UNLOCKED status
                const dhupId = selected.dhup;
                if (dhupId && unlocked[dhupId]) {
                    setSelectedDhupIcon(ITEM_ICONS[dhupId]);
                } else {
                    setSelectedDhupIcon(null);
                }

                // Map Thali ID, checking UNLOCKED status
                const thaliId = selected.thali;
                if (thaliId && unlocked[thaliId] && ITEM_ICONS[thaliId]) {
                    setSelectedThaliIcon(ITEM_ICONS[thaliId]);
                } else {
                    // Default fallback to my_diya.png
                    setSelectedThaliIcon(require('../assets/images/my_diya.png'));
                }

                // Map Sound ID, checking UNLOCKED status
                const soundId = selected.sound;
                if (soundId && unlocked[soundId] && INSTRUMENT_SOUNDS[soundId]) {
                    setSelectedSoundId(soundId);
                    setSelectedSoundIcon(ITEM_ICONS[soundId]);

                } else {
                    // Default fallback to Shankh
                    setSelectedSoundId('s1');
                    setSelectedSoundIcon(require('../assets/images/shankh_icon.png'));
                }
            };

            fetchSelections();
        }, [])
    );


    const togglePrasad = () => {
        if (selectedPrasadIcons.length === 0) {
            Alert.alert(
                language === 'hi' ? "प्रसाद चुनें" : "Select Prasad",
                language === 'hi' ? "कृपया सामग्री स्टोर से प्रसाद चुनें और अनलॉक करें।" : "Please select and unlock prasad items from the Samagri Store."
            );
            return;
        }

        if (prasadTimeoutRef.current) {
            clearTimeout(prasadTimeoutRef.current);
            prasadTimeoutRef.current = null;
        }

        const nextState = !isPrasadVisible;
        setIsPrasadVisible(nextState);

        if (nextState) {
            // Auto hide after 10 seconds
            prasadTimeoutRef.current = setTimeout(() => {
                setIsPrasadVisible(false);
                prasadTimeoutRef.current = null;
            }, 10000);
        }
    };

    const toggleDhup = () => {
        if (!selectedDhupIcon) {
            Alert.alert(
                language === 'hi' ? "धूप/दिया चुनें" : "Select Dhup/Diya",
                language === 'hi' ? "कृपया सामग्री स्टोर से धूप या दिया चुनें और अनलॉक करें।" : "Please select and unlock Dhup or Diya from the Samagri Store."
            );
            return;
        }

        if (dhupTimeoutRef.current) {
            clearTimeout(dhupTimeoutRef.current);
            dhupTimeoutRef.current = null;
        }

        const nextState = !isDhupVisible;
        setIsDhupVisible(nextState);

        if (nextState) {
            // Auto hide after 10 seconds
            dhupTimeoutRef.current = setTimeout(() => {
                setIsDhupVisible(false);
                dhupTimeoutRef.current = null;
            }, 10000);
        }
    };

    const [backgroundImage, setBackgroundImage] = useState(Image.resolveAssetSource(require('../assets/images/default_darshan.jpg')).uri);


    // Load saved background whenever screen gains focus
    useFocusEffect(
        useCallback(() => {
            const loadBackground = async () => {
                try {
                    const saved = await AsyncStorage.getItem('saved_background_image');
                    if (saved) {
                        setBackgroundImage(saved);
                        // TEST: Force a broken URL to verify fallback
                        // setBackgroundImage('https://this-url-does-not-exist.com/broken.jpg');
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

    // --- Divya Progress System State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [streak, setStreak] = useState(1);
    const [challengeGoal, setChallengeGoal] = useState(7);
    const [divyaCoins, setDivyaCoins] = useState(0);
    const [punyaDays, setPunyaDays] = useState(0);
    const [streakDataLoaded, setStreakDataLoaded] = useState(false);
    const [isShieldPopupVisible, setShieldPopupVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (isUIReady) {
                checkDailyStreak();
            }
        }, [isUIReady])
    );

    const checkDailyStreak = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastDate = await AsyncStorage.getItem('lastDarshanDate');

            // 1. Load Current Stats
            const storedStreak = await AsyncStorage.getItem('currentStreak');
            const storedGoal = await AsyncStorage.getItem('streakGoal');
            const storedCoins = await AsyncStorage.getItem('divyaCoins');
            const storedShields = await AsyncStorage.getItem('punyaDays');

            let currentStreak = parseInt(storedStreak) || 0;
            let currentGoal = parseInt(storedGoal) || 7;
            let currentCoins = parseInt(storedCoins) || 0;
            let currentShields = parseInt(storedShields) || 0;

            let newStreak = currentStreak;
            let newGoal = currentGoal;
            let newCoins = currentCoins;
            let newShields = currentShields;
            let shouldAutoPlay = false;

            if (!lastDate) {
                // First time ever
                newStreak = 1;
                newCoins = 1;
                shouldAutoPlay = true;
            } else if (lastDate === today) {
                // Same day refresh
                shouldAutoPlay = false;
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === yesterdayStr) {
                    // Consecutive Day (+)
                    newStreak += 1;
                    newCoins += 1;
                    shouldAutoPlay = true;

                    // Milestone Logic (Day 7/7, 14/14, etc.)
                    if (newStreak === newGoal) {
                        newCoins += 3; // Bonus
                        newShields += 1; // Award Shield
                        newGoal += 7; // Increment goal
                    }
                } else {
                    // Missed Day(s)
                    const lastDateObj = new Date(lastDate);
                    const todayObj = new Date(today);
                    const diffTime = Math.abs(todayObj - lastDateObj);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 2 && currentShields > 0) {
                        // Missed exactly 1 day and has shield
                        newShields -= 1;
                        newStreak += 1; // Treat as if they came yesterday to maintain progress
                        newCoins += 1; // Reward for "saving" the day
                        setShieldPopupVisible(true);
                        shouldAutoPlay = true;

                        // Milestone check even on shield day
                        if (newStreak === newGoal) {
                            newCoins += 3;
                            newShields += 1;
                            newGoal += 7;
                        }
                    } else {
                        // Reset everything
                        newStreak = 1;
                        newGoal = 7;
                        newCoins += 1; // Still give 1 coin for coming back
                        shouldAutoPlay = true;
                    }
                }
            }

            // Update State
            setStreak(newStreak);
            setChallengeGoal(newGoal);
            setDivyaCoins(newCoins);
            setPunyaDays(newShields);
            setStreakDataLoaded(true);

            // Persist Data
            if (lastDate !== today) {
                const expiry = Date.now() + 24 * 60 * 60 * 1000;
                await AsyncStorage.setItem('lastDarshanDate', today);
                await AsyncStorage.setItem('currentStreak', newStreak.toString());
                await AsyncStorage.setItem('streakGoal', newGoal.toString());
                await AsyncStorage.setItem('divyaCoins', newCoins.toString());
                await AsyncStorage.setItem('punyaDays', newShields.toString());
                await AsyncStorage.setItem('samagri_unlock_expiry', expiry.toString());
            }

            if (shouldAutoPlay) {
                setTimeout(() => performAarti(), 1000);
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
            await AsyncStorage.removeItem('streakGoal');
            await AsyncStorage.removeItem('divyaCoins');
            await AsyncStorage.removeItem('punyaDays');
            setStreak(1);
            setChallengeGoal(7);
            setDivyaCoins(0);
            setPunyaDays(0);
            Alert.alert("Testing Mode", "Progress Reset!");
        } catch (e) {
            console.error(e);
        }
    };


    // --- Animations & Sound ---
    const bellRotation = useSharedValue(0);
    const diyaOpacity = useSharedValue(1);
    const soundRef = useRef(null);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const stopBell = async () => {
        cancelAnimation(bellRotation);
        bellRotation.value = withTiming(0, { duration: 500 });
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
            } catch (e) { }
            soundRef.current = null;
        }
        setIsRinging(false);
    };

    const ringBell = async () => {
        if (isRinging) return;
        setIsRinging(true);

        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/bell-sound.mp3'),
                { shouldPlay: true, isLooping: true }
            );
            soundRef.current = sound;

            bellRotation.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-15, { duration: 500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // If NOT part of a full Aarti, start a local timer to stop
            if (!isAartiActive) {
                setTimeout(() => {
                    if (!isAartiActive) stopBell();
                }, PUJA_DURATION);
            }
        } catch (error) {
            console.log('Error playing sound:', error);
            setIsRinging(false);
        }
    };

    // --- Instrument Sound (Dynamic) ---
    const instrumentSoundRef = useRef(null);

    // Cleanup instrument on unmount
    useEffect(() => {
        return () => {
            if (instrumentSoundRef.current) {
                instrumentSoundRef.current.unloadAsync();
            }
        };
    }, []);

    const toggleInstrumentPlayback = async () => {
        if (isInteractionDisabled || isInstrumentPlaying) return;

        setIsInstrumentPlaying(true);
        try {
            const soundFile = INSTRUMENT_SOUNDS[selectedSoundId] || INSTRUMENT_SOUNDS['s1'];
            const { sound } = await Audio.Sound.createAsync(
                soundFile,
                { shouldPlay: true }
            );
            instrumentSoundRef.current = sound;

            // Auto-reset state when playback finishes
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsInstrumentPlaying(false);
                    sound.unloadAsync(); // Cleanup
                }
            });

        } catch (error) {
            console.log('Error playing instrument:', error);
            setIsInstrumentPlaying(false);
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





    const stopAllPujaEffects = useCallback(() => {
        // console.log('--- CLEANUP TRIGGERED ---');

        // 1. Stop Bell
        stopBell();

        // 2. Stop Instrument
        if (instrumentSoundRef.current) {
            instrumentSoundRef.current.stopAsync().catch(() => { });
            instrumentSoundRef.current.unloadAsync().catch(() => { });
            instrumentSoundRef.current = null;
        }
        setIsInstrumentPlaying(false);

        // 3. Stop Interval Generation
        if (showerIntervalRef.current) {
            clearInterval(showerIntervalRef.current);
            showerIntervalRef.current = null;
        }
        if (coinIntervalRef.current) {
            clearInterval(coinIntervalRef.current);
            coinIntervalRef.current = null;
        }
        setIsGarlandVisible(false);
        setIsPrasadVisible(false);
        setIsDhupVisible(false);
    }, []);

    // FAIL-SAFE 1: Watch isAartiActive for the stop signal
    useEffect(() => {
        if (!isAartiActive) {
            stopAllPujaEffects();
        }
    }, [isAartiActive, stopAllPujaEffects]);

    const performAarti = () => {
        if (isAartiActive) return;
        setIsAartiActive(true);

        // Trigger all effects
        toggleInstrumentPlayback();
        ringBell();
        triggerFlowerShower();
        triggerCoinShower();
        if (selectedPrasadIcons.length > 0) {
            setIsPrasadVisible(true);
            // Clear any manual toggle timeout
            if (prasadTimeoutRef.current) {
                clearTimeout(prasadTimeoutRef.current);
                prasadTimeoutRef.current = null;
            }
        }

        if (selectedDhupIcon) {
            setIsDhupVisible(true);
            // Clear any manual toggle timeout
            if (dhupTimeoutRef.current) {
                clearTimeout(dhupTimeoutRef.current);
                dhupTimeoutRef.current = null;
            }
        }

        aartiScale.value = withTiming(1.5, { duration: 500 });

        aartiRotation.value = withTiming(360 * 6, {
            duration: PUJA_DURATION,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                aartiRotation.value = 0;
                aartiScale.value = withTiming(1, { duration: 1000 });
                runOnJS(setIsAartiActive)(false);
            }
        });

        // FAIL-SAFE 2: Hard stop after 19 seconds (JS Side)
        setTimeout(() => {
            setIsAartiActive(false);
            stopAllPujaEffects();
        }, PUJA_DURATION + 1000);
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

    const stopFlowerShower = () => {
        if (showerIntervalRef.current) {
            clearInterval(showerIntervalRef.current);
            showerIntervalRef.current = null;
        }
        setIsGarlandVisible(false);
        setIsFlowerShowerActive(false);
    };

    const triggerFlowerShower = () => {
        if (isInteractionDisabled || showerIntervalRef.current) return;
        setIsFlowerShowerActive(true);

        // Automatically show Mala if one is selected/unlocked
        if (selectedGarlandIcon) {
            setIsGarlandVisible(true);
        }

        const startTime = Date.now();
        const addBatch = () => {
            // FAIL-SAFE 3: Self-terminating interval
            if (Date.now() - startTime > (PUJA_DURATION - 5000)) {
                stopFlowerShower();
                return;
            }

            // Fallback if no flowers are selected (shouldn't happen with defaults)
            const availableIcons = selectedFlowerIcons.length > 0 ? selectedFlowerIcons : FLOWER_IMAGES;

            const newFlowers = Array.from({ length: 2 }, (_, i) => ({
                id: `${Date.now()}-${i}-${Math.random()}`,
                imageSource: availableIcons[Math.floor(Math.random() * availableIcons.length)]
            }));
            setActiveFlowers(prev => [...prev, ...newFlowers]);
        };

        addBatch();
        showerIntervalRef.current = setInterval(addBatch, 300);
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

    // Clear flowers state after intervals stop and items finish falling
    useEffect(() => {
        if (activeFlowers.length > 0 && !showerIntervalRef.current) {
            const timer = setTimeout(() => {
                setActiveFlowers([]);
            }, 8000); // Give time for last batch to fall
            return () => clearTimeout(timer);
        }
    }, [activeFlowers.length, showerIntervalRef.current]);

    // --- Coin Shower State ---
    const [activeCoins, setActiveCoins] = useState([]);
    const coinIntervalRef = useRef(null);


    const stopCoinShower = () => {
        if (coinIntervalRef.current) {
            clearInterval(coinIntervalRef.current);
            coinIntervalRef.current = null;
        }
        setIsCoinShowerActive(false);
    };

    const triggerCoinShower = () => {
        if (isInteractionDisabled || coinIntervalRef.current) return;
        setIsCoinShowerActive(true);

        const startTime = Date.now();
        const addBatch = () => {
            // FAIL-SAFE 3: Self-terminating interval
            if (Date.now() - startTime > (PUJA_DURATION - 5000)) {
                stopCoinShower();
                return;
            }

            // Fallback if no coins are selected (shouldn't happen with defaults)
            const availableIcons = selectedCoinIcons.length > 0 ? selectedCoinIcons : COIN_IMAGES;

            const newCoins = Array.from({ length: 2 }, (_, i) => ({
                id: `${Date.now()}-${i}-${Math.random()}`,
                imageSource: availableIcons[Math.floor(Math.random() * availableIcons.length)]
            }));
            setActiveCoins(prev => [...prev, ...newCoins]);
        };

        addBatch();
        coinIntervalRef.current = setInterval(addBatch, 300);
    };

    const removeCoin = (index) => { };

    useEffect(() => {
        return () => {
            if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
        };
    }, []);

    // Clear coins state after intervals stop and items finish falling
    useEffect(() => {
        if (activeCoins.length > 0 && !coinIntervalRef.current) {
            const timer = setTimeout(() => {
                setActiveCoins([]);
            }, 8000); // Give time for last batch to fall
            return () => clearTimeout(timer);
        }
    }, [activeCoins.length, coinIntervalRef.current]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. Background Wallpaper */}
            <Image
                source={{ uri: backgroundImage }}
                style={styles.background}
                resizeMode="cover"
                onError={() => {
                    setBackgroundImage(Image.resolveAssetSource(require('../assets/images/default_darshan.jpg')).uri);
                }}
            />

            {/* 2. Garland Mala Layer */}
            <GarlandMala isVisible={isGarlandVisible} imageSource={selectedGarlandIcon} />

            {/* 3. Prasad (Samagri) Layer */}
            <PrasadDisplay
                isVisible={isPrasadVisible}
                items={selectedPrasadIcons}
                isDhupVisible={isDhupVisible}
                dhupIcon={selectedDhupIcon}
            />

            {/* 4. Falling Flowers Layer */}
            {activeFlowers.map((flower, index) => (
                <FallingFlower key={flower.id} index={index} onComplete={removeFlower} imageSource={flower.imageSource} />
            ))}

            {/* 5. Falling Coins Layer */}
            {activeCoins.map((coin, index) => (
                <FallingCoin key={coin.id} index={index} onComplete={removeCoin} imageSource={coin.imageSource} />
            ))}

            {/* 2. Top Layer: Hanging Bells */}
            {/* User requested to move bells UP. Removed safe area constraint to allow them to go higher */}
            <View style={[styles.bellsContainer, { top: insets.top - 25 }]}>
                <TouchableOpacity onPress={ringBell} activeOpacity={0.8} disabled={isInteractionDisabled}>
                    <Animated.View style={[styles.bellWrapper, styles.bellLeft, bellStyle, isInteractionDisabled && { opacity: 0.5 }]}>
                        <View style={styles.bellString} />
                        <Text style={styles.bellEmoji}>🔔</Text>
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ringBell} activeOpacity={0.8} disabled={isInteractionDisabled}>
                    <Animated.View style={[styles.bellWrapper, styles.bellRight, bellStyle, isInteractionDisabled && { opacity: 0.5 }]}>
                        <View style={styles.bellString} />
                        <Text style={styles.bellEmoji}>🔔</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* ... */}



            {/* 4. Side Icons Layer */}
            <View style={[styles.sidesContainer, { bottom: insets.bottom + 145 }]}>
                {/* Left Column - 3 buttons */}
                <View style={styles.leftColumn}>
                    <SideIcon
                        imageSource={selectedPrasadIcons.length > 0 ? selectedPrasadIcons[0] : ITEM_ICONS['sa5']}
                        label={language === 'hi' ? 'प्रसाद' : 'Prasad'}
                        onPress={togglePrasad}
                        disabled={isInteractionDisabled}
                    />

                    <SideIcon
                        imageSource={selectedFlowerIcons.length > 0 ? selectedFlowerIcons[0] : ITEM_ICONS['f1']}
                        label={t.flowers || 'Flowers'}
                        onPress={triggerFlowerShower}
                        disabled={isInteractionDisabled}
                    />

                    <SideIcon
                        imageSource={selectedCoinIcons.length > 0 ? selectedCoinIcons[0] : ITEM_ICONS['c1']}
                        label={t.coins || 'Coins'}
                        onPress={triggerCoinShower}
                        disabled={isInteractionDisabled}
                    />
                    <SideIcon
                        imageSource={selectedSoundIcon}
                        label={
                            selectedSoundId === 's1' ? t.shankh :
                                selectedSoundId === 's2' ? t.bell :
                                    selectedSoundId === 's3' ? t.majira :
                                        selectedSoundId === 's4' ? t.drum :
                                            t.shankh
                        }
                        onPress={toggleInstrumentPlayback}
                        disabled={isInteractionDisabled}
                    />
                </View>

                {/* Right Column - 3 buttons */}
                <View style={styles.rightColumn}>
                    <SideIcon
                        imageSource={selectedDhupIcon ? selectedDhupIcon : ITEM_ICONS['dd1']}
                        label={language === 'hi' ? 'धूप/दिया' : 'Dhup/Diya'}
                        onPress={toggleDhup}
                        disabled={isInteractionDisabled}
                    />
                    <SideIcon
                        iconName="book-outline"
                        label={t.slokas}
                        onPress={() => navigation.navigate('Slokas')}
                        disabled={isInteractionDisabled}
                    />
                    <SideIcon
                        iconName="radio-button-on-outline"
                        label={t.chanting}
                        onPress={() => navigation.navigate('MantraSelection')}
                        disabled={isInteractionDisabled}
                    />
                    <SideIcon
                        iconName="information-circle-outline"
                        label={t.about || 'About'}
                        onPress={() => navigation.navigate('Settings')}
                        disabled={isInteractionDisabled}
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
                        disabled={isInteractionDisabled}
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
                        disabled={isInteractionDisabled}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 16, color: '#000', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 }}>
                                {divyaCoins}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#2b1803', fontWeight: 'bold', textShadowColor: '#fff', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 0.5 }}>
                            {language === 'hi' ? 'दिव्य मुद्रा' : 'Divya Coins'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <BottomNav navigation={navigation} activeTab="Puja" disabled={isInteractionDisabled} />
            </View>

            {/* Central Big Diya Layered Above EVERYTING - Now outside bottomNav to avoid pushing layout */}
            <View style={[styles.centerThaliContainer, { bottom: insets.bottom + 35 }]} pointerEvents="box-none">

                <TouchableOpacity onPress={performAarti} activeOpacity={0.8} disabled={isInteractionDisabled}>
                    <Animated.Image
                        source={selectedThaliIcon}
                        style={[styles.thaliImage, diyaStyle, isInteractionDisabled && { opacity: 0.6 }]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* --- Shield Consumed Popup --- */}
            <Modal
                transparent={true}
                visible={isShieldPopupVisible}
                animationType="fade"
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ backgroundColor: '#FFF9C4', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
                            <Ionicons name="shield-checkmark" size={40} color="#FBC02D" />
                        </View>
                        <Text style={[styles.modalTitle, { textAlign: 'center' }]}>{t.shieldTitle}</Text>
                        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>{t.shieldMsg}</Text>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#9c6ce6', justifyContent: 'center' }]}
                            onPress={() => setShieldPopupVisible(false)}
                        >
                            <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t.ok}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        bottom: 180, // Increased to move icons up so labels don't hide behind tab bar
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
        bottom: 80,
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
        backgroundColor: '#4dabf7', // Techy Green glow
        shadowColor: '#4dabf7',
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
        backgroundColor: '#4dabf7',
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
        color: '#9c6ce6', // Gold/DarkYellow
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
        backgroundColor: '#9c6ce6',
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
        color: '#9c6ce6', // Highlight active bottom tab
        textDecorationLine: 'underline',
    },

});

export default DailyDarshanScreen;

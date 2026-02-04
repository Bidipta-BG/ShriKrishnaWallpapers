import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
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
        const targetY = height - 190 + (Math.random() * 20);

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
        const targetY = height - 190 + (Math.random() * 20);

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
const SideIcon = ({ color, emoji, imageSource, label, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: color || 'rgba(0,0,0,0.4)' }]}>
                {imageSource ? (
                    <Image source={imageSource} style={{ width: 30, height: 30 }} resizeMode="contain" />
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
        like: 'Like',
        favourite: 'Favourite',
        downloaded: 'Image Saved!',
        downloadSuccess: 'The image has been saved to your gallery.',
        permissionRequired: 'Permission Required',
        permissionMsg: 'Please grant permission to save images.'
    },
    hi: {
        flowers: 'पुष्प',
        coins: 'मुद्रा',
        shankh: 'शंख',
        more: 'अधिक',
        slokas: 'श्लोक',
        chanting: 'जाप',
        share: 'साझा करें',
        about: 'बारे में',
        allImages: 'सभी चित्र',
        allMantras: 'सभी मंत्र/गीत',
        download: 'डाउनलोड',
        saveImage: 'सहेजें',
        setHomeWallpaper: 'होम स्क्रीन सेट करें',
        setLockWallpaper: 'लॉक स्क्रीन सेट करें',
        cancel: 'रद्द करें',
        alarm: 'अलार्म',
        scheduleDarshan: 'दैनिक दर्शन',
        play: 'चलाएं',
        pause: 'रोकें',
        like: 'पसंद',
        favourite: 'पसंदीदा',
        downloaded: 'छवि सहेजी गई!',
        downloadSuccess: 'छवि आपकी गैलरी में सहेजी गई है।',
        permissionRequired: 'अनुमति आवश्यक है',
        permissionMsg: 'कृपया चित्र सहेजने के लिए अनुमति दें।'
    },
    // Add other languages as needed, defaulting to English for now
};

const DailyDarshanScreen = ({ navigation }) => {
    const { language, isUIReady } = useLanguage();
    const insets = useSafeAreaInsets();
    const route = useRoute();

    const [backgroundImage, setBackgroundImage] = useState('https://m.media-amazon.com/images/I/61k71BV8B3L._AC_UF1000,1000_QL80_.jpg');

    // Load saved background whenever screen gains focus
    useFocusEffect(
        useCallback(() => {
            const loadBackground = async () => {
                try {
                    const saved = await AsyncStorage.getItem('saved_background_image');
                    if (saved) {
                        setBackgroundImage(saved);
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
    const [streak, setStreak] = useState(1);
    const [challengeGoal, setChallengeGoal] = useState(7);
    const [streakDataLoaded, setStreakDataLoaded] = useState(false);

    // --- Like & User Identity ---
    const [deviceId, setDeviceId] = useState(null);
    const [likeCount, setLikeCount] = useState(108); // Mock total
    const [isLiked, setIsLiked] = useState(false); // Does THIS device like it?

    const [isFavourite, setIsFavourite] = useState(false);

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
    const [isSaveModalVisible, setSaveModalVisible] = useState(false);

    // --- Music Player State (Restored) ---
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loopMode, setLoopMode] = useState(1); // Default 1 (1 repeat/play)
    const [playbackStatus, setPlaybackStatus] = useState({ position: 0, duration: 1 });

    const playCountRef = useRef(0); // Track how many times played
    const currentLoopModeRef = useRef(1); // Store for callback access


    // --- Favorite Logic ---
    const toggleFavorite = async () => {
        try {
            // 1. Load Current List
            const storedFavs = await AsyncStorage.getItem('favourite_images_list');
            let favList = storedFavs ? JSON.parse(storedFavs) : [];

            // 2. Check if already favorite
            const existingIndex = favList.findIndex(item =>
                item.uri === backgroundImage || item.original === backgroundImage
            );

            if (existingIndex !== -1) {
                // ALREADY FAVORITE -> REMOVE
                favList.splice(existingIndex, 1);
                await AsyncStorage.setItem('favourite_images_list', JSON.stringify(favList));
                setIsFavourite(false);
                // Optional: Delete local file (skipped for simplicity, cache will auto-clear eventually or can implement later)
            } else {
                // NOT FAVORITE -> ADD
                if (favList.length >= 10) {
                    Alert.alert("Limit Reached", "You can only save up to 10 favorite images.");
                    return;
                }

                // Download specific file for persistent storage
                const filename = `fav_${Date.now()}.jpg`;
                const fileUri = `${FileSystem.documentDirectory}${filename}`;

                // Download or Copy file depending on source
                let uri;
                if (backgroundImage.startsWith('http')) {
                    const result = await FileSystem.downloadAsync(backgroundImage, fileUri);
                    uri = result.uri;
                } else {
                    // It's already a local file (e.g. from gallery cache), so just copy it
                    await FileSystem.copyAsync({ from: backgroundImage, to: fileUri });
                    uri = fileUri;
                }

                const newFav = {
                    id: Date.now().toString(),
                    uri: uri, // Save Local Path
                    original: backgroundImage
                };

                favList.push(newFav);
                await AsyncStorage.setItem('favourite_images_list', JSON.stringify(favList));
                setIsFavourite(true);
                Alert.alert("Added to Favorites", "Saved to your Favorite Tab.");
            }
        } catch (e) {
            console.log("Fav Error:", e);
            Alert.alert("Error", "Could not update favorites.");
        }
    };

    // Check if current image is favorite on load/change
    useEffect(() => {
        const checkFavStatus = async () => {
            const storedFavs = await AsyncStorage.getItem('favourite_images_list');
            if (storedFavs) {
                const favList = JSON.parse(storedFavs);
                // Check if current background URL or a vaguely matching ID exists
                // Since background changes dynamic, check by URI string match
                const exists = favList.some(item => item.original === backgroundImage || item.uri === backgroundImage);
                setIsFavourite(exists);
            }
        };
        checkFavStatus();
    }, [backgroundImage]);


    // --- Like Logic (Mock Device-based) ---
    useEffect(() => {
        const initIdentity = async () => {
            try {
                let id = await AsyncStorage.getItem('user_device_id');
                if (!id) {
                    id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    await AsyncStorage.setItem('user_device_id', id);
                }
                setDeviceId(id);
            } catch (e) {
                console.log("Identity Error:", e);
            }
        };
        initIdentity();
    }, []);

    const checkLikeStatus = async () => {
        try {
            const likedImages = await AsyncStorage.getItem('liked_images_list');
            const list = likedImages ? JSON.parse(likedImages) : [];
            const liked = list.includes(backgroundImage);
            setIsLiked(liked);

            // Mock random total count for demo
            setLikeCount(liked ? 109 : 108);
        } catch (e) {
            console.log("Check Like Error:", e);
        }
    };

    useEffect(() => {
        checkLikeStatus();
    }, [backgroundImage]);

    const handleLike = async () => {
        try {
            const likedImages = await AsyncStorage.getItem('liked_images_list');
            let list = likedImages ? JSON.parse(likedImages) : [];

            if (isLiked) {
                // UNLIKE
                list = list.filter(url => url !== backgroundImage);
                setIsLiked(false);
                setLikeCount(prev => prev - 1);
            } else {
                // LIKE
                list.push(backgroundImage);
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }

            await AsyncStorage.setItem('liked_images_list', JSON.stringify(list));

            // Note: In real backend, you'd send { imageId, deviceId } here.
            console.log(`Syncing with backend: Device ${deviceId} liked ${backgroundImage}`);

        } catch (e) {
            console.log("Like Error:", e);
        }
    };


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

    const handleSaveOption = async (option) => {
        setSaveModalVisible(false);

        if (option === 'download') {
            await downloadImage();
        } else if (option === 'share') {
            await shareImage();
        }
    };

    const downloadImage = async () => {
        try {
            // Request WRITE-ONLY permissions to avoid needing READ_AUDIO/READ_VIDEO causing manifest errors
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert(t.permissionRequired, t.permissionMsg);
                return;
            }

            const uri = await downloadToCache();
            if (uri) {
                // Modified: Using createAssetAsync instead of deprecated saveToLibraryAsync
                const asset = await MediaLibrary.createAssetAsync(uri);
                // On Android, createAssetAsync automatically saves to "Pictures" or "DCIM".
                // We could also move it to a specific album using createAlbumAsync if desired,
                // but createAssetAsync is sufficient for "Download" behavior.

                if (asset) {
                    Alert.alert(t.downloaded, t.downloadSuccess);
                } else {
                    throw new Error("Could not create asset.");
                }
            }
        } catch (e) {
            console.log("Download Error:", e);
            Alert.alert("Error", e.message || "Failed to save image.");
        }
    };

    const shareImage = async () => {
        const uri = await downloadToCache();
        if (uri) {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing is not available on this device");
                return;
            }
            await Sharing.shareAsync(uri);
        }
    };


    // --- Audio Logic ---
    useEffect(() => {
        // Enable background audio
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playMusic = async () => {
        try {
            if (sound) {
                // If loaded, just play/pause
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                // Load Main Music
                const { sound: newSound } = await Audio.Sound.createAsync(
                    require('../assets/sounds/main-music.mp3'),
                    { shouldPlay: true, isLooping: false } // Manual looping
                );

                setSound(newSound);
                setIsPlaying(true);
                playCountRef.current = 1;
                currentLoopModeRef.current = loopMode;

                newSound.setOnPlaybackStatusUpdate(status => {
                    if (status.isLoaded) {
                        setPlaybackStatus({
                            position: status.positionMillis,
                            duration: status.durationMillis || 1
                        });

                        if (status.didJustFinish) {
                            if (playCountRef.current < currentLoopModeRef.current) {
                                playCountRef.current += 1;
                                newSound.replayAsync();
                            } else {
                                setIsPlaying(false);
                                newSound.stopAsync(); // Stop and reset
                                playCountRef.current = 1;
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.log('Error playing music:', error);
        }
    };

    const toggleLoopMode = async () => {
        // Cycle 1 -> 2 -> 3 -> 4 -> 1
        setLoopMode(prev => {
            const next = prev >= 4 ? 1 : prev + 1;
            currentLoopModeRef.current = next; // Update ref instantaneously
            return next;
        });
        // Logic handled in callback via ref
    };

    const togglePlayPause = () => {
        playMusic();
    };

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
                { translateY: -radius * (1 - Math.cos(angleRad)) - (aartiScale.value - 1) * 120 }
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
            <StatusBar barStyle="light-content" />

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
            <View style={[styles.bellsContainer, { top: 10 }]}>
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
                {/* Left Column - 4 buttons */}
                <View style={styles.leftColumn}>
                    <SideIcon
                        emoji="👍"
                        label={`${likeCount} ${t.like}`}
                        color={isLiked ? "#3498DB" : "#E74C3C"} // Blue if Liked, Red otherwise
                        onPress={handleLike}
                    />
                    <SideIcon
                        emoji="🌼"
                        label={t.flowers}
                        color="#F1C40F"
                        onPress={triggerFlowerShower}
                    />

                    <SideIcon
                        emoji="🪙"
                        label={t.coins}
                        color="#F39C12"
                        onPress={triggerCoinShower}
                    />
                    <SideIcon
                        emoji="🐚"
                        label={t.shankh}
                        onPress={playShankh}
                    />
                </View>

                {/* Right Column - 4 buttons */}
                <View style={styles.rightColumn}>
                    <SideIcon
                        emoji={isFavourite ? "❤️" : "♡"}
                        label={t.favourite}
                        color="#F1C40F"
                        onPress={toggleFavorite}
                    />
                    <SideIcon
                        imageSource={require('../assets/images/sri-krishna-slokas.png')}
                        label={t.slokas}
                        color="#E67E22"
                        onPress={() => navigation.navigate('Slokas')}
                    />
                    <SideIcon
                        imageSource={require('../assets/images/rudraksh-mala.png')}
                        label={t.chanting}
                        color="#D35400"
                        onPress={() => navigation.navigate('MantraSelection')}
                    />
                    <SideIcon
                        emoji="💾"
                        label={t.saveImage}
                        color="#9B59B6"
                        onPress={() => setSaveModalVisible(true)}
                    />
                </View>
            </View>

            {/* 5. Bottom Controls */}
            <View style={styles.bottomSection}>
                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Gallery')}
                        style={{ padding: 8, zIndex: 100 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.tabItem}>{t.allImages}</Text>
                    </TouchableOpacity>

                    {/* Streak Counter (Center) */}
                    <View style={{ alignItems: 'center', minWidth: 100 }}>
                        <Text style={{ fontSize: 16, color: '#8b0000', fontWeight: 'bold' }}>
                            {language === 'hi' ? `दिन ${streak}/${challengeGoal}` : `Day ${streak}/${challengeGoal}`}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#5e3a0e', fontWeight: '600' }}>
                            {language === 'hi' ? 'चैलेंज' : 'Challenge'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ScheduleDarshan')}
                        style={{ padding: 8 }}
                    >
                        <Text style={styles.tabItem}>{t.scheduleDarshan}</Text>
                    </TouchableOpacity>
                </View>



                {/* Player Bar */}
                {/* Player Bar */}
                {/* Player Bar */}
                {/* Progress Bar (Moved to Top of Yellow Section) */}
                <View style={styles.progressBarContainerTop}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${(playbackStatus.position / playbackStatus.duration) * 100}%` }
                        ]}
                    />
                </View>

                {/* Player Bar */}
                <View style={styles.playerBar}>
                    {/* Controls container (Left Side) */}
                    <View style={styles.controlsContainer}>
                        {/* Play Button */}
                        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                            <Text style={styles.playIcon}>{isPlaying ? "⏸️" : "▶️"}</Text>
                            <Text style={styles.playLabel}>{isPlaying ? t.pause : t.play}</Text>
                        </TouchableOpacity>

                        {/* Loop Button */}
                        <TouchableOpacity style={styles.loopButton} onPress={toggleLoopMode}>
                            <View style={styles.loopContent}>
                                <Text style={styles.loopNumber}>{loopMode}</Text>
                                <Text style={styles.loopText}>repeat</Text>
                            </View>
                        </TouchableOpacity>


                    </View>

                    {/* Spacer for Diya */}
                    <View style={{ width: 60 }} />

                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => navigation.navigate('About')}
                    >
                        <Text style={styles.moreIcon}>ℹ️</Text>
                        <Text style={styles.moreText}>{t.about}</Text>
                    </TouchableOpacity>
                </View>

                {/* Central Big Diya */}
                <View style={[styles.centerThaliContainer]} pointerEvents="box-none">
                    <TouchableOpacity onPress={performAarti} activeOpacity={0.8}>
                        <Animated.Text style={[styles.thaliEmoji, diyaStyle]}>🪔</Animated.Text>
                    </TouchableOpacity>
                </View>

                {/* Safe Area Spacer for Bottom */}
                <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#CD9730' }} />
            </View>

            {/* --- Save Options Modal --- */}
            <Modal
                transparent={true}
                visible={isSaveModalVisible}
                animationType="fade"
                onRequestClose={() => setSaveModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSaveModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.saveImage}</Text>

                        <TouchableOpacity style={styles.modalButton} onPress={() => handleSaveOption('download')}>
                            <Text style={styles.modalButtonText}>⬇️  {t.download}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={() => handleSaveOption('share')}>
                            <Text style={styles.modalButtonText}>📤  {t.share}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setSaveModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Playlist Modal Removed --- */}
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
        bottom: 190, // Increased to move icons up so labels don't hide behind tab bar
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
    // --- Bottom Section ---
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent track
        zIndex: 60, // Ensure it's above the centerThaliContainer (zIndex 50)
    },
    tabItem: {
        color: '#5e3a0e', // Dark brown
        fontWeight: 'bold',
        fontSize: 16,
    },
    centerThaliContainer: {
        position: 'absolute',
        bottom: 50, // Increased from 20 to move up
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none', // Allow clicks to pass through if needed, or remove if interactive
    },
    thaliEmoji: {
        fontSize: 80,
    },
    playerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#CD9730', // Gold/DarkYellow bar
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    playButton: {
        alignItems: 'center',
        marginRight: 10,
    },
    playIcon: {
        fontSize: 32, // Increased size
        color: '#fff',
    },
    playLabel: {
        color: '#8b0000',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: -1, // Adjusted for larger icon
    },
    loopButton: {
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.2)', // Slight bg for shape
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    loopContent: {
        alignItems: 'center',
    },
    loopNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8b0000', // Matches theme
    },
    loopText: {
        fontSize: 8,
        color: '#5e3a0e', // Dark brown
        fontWeight: '600',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // flex: 1, // Removed flex to pack buttons to the left
        marginRight: 10,
    },
    progressBarContainerTop: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent track
        // No border radius for full width look, or keep it if desired
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#8b0000', // Deep Red fill
    },
    moreButton: {
        alignItems: 'center',
    },
    moreIcon: {
        fontSize: 30,
        color: '#8b0000',
    },
    moreText: {
        color: '#8b0000',
        fontSize: 12,
        fontWeight: 'bold',
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
        flex: 1,
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

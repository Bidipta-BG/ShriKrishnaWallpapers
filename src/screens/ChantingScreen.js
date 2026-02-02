import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, Vibration, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

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
    const target = mantra.count;

    // Animation values
    const scale = useSharedValue(1);
    const rippleOpacity = useSharedValue(0);
    const rippleScale = useSharedValue(0);

    const handlePress = async () => {
        if (count >= target) return;

        // 1. Haptic Feedback
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
            // Fallback for devices without haptics
            Vibration.vibrate(50);
        }

        // 2. Animate Button (Shrink then grow)
        scale.value = withSequence(
            withTiming(0.9, { duration: 50 }),
            withSpring(1, { damping: 10 })
        );

        // 3. Ripple Effect
        rippleScale.value = 0;
        rippleOpacity.value = 0.5;
        rippleScale.value = withTiming(1.5, { duration: 400 });
        rippleOpacity.value = withTiming(0, { duration: 400 });

        // 4. Update Count
        const newCount = count + 1;
        setCount(newCount);

        // 5. Check Completion
        if (newCount === target) {
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(t.completed, `${t.wellDone} ${target} ${t.rounds}`, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }, 300);
        }
    };

    const handleReset = () => {
        Alert.alert(t.reset, "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => setCount(0) }
        ]);
    };

    const handleInfo = () => {
        const detailText = isHindi
            ? (mantra.details?.hi || mantra.benefit.hi)
            : (mantra.details?.en || mantra.benefit.en);

        Alert.alert(
            isHindi ? 'मंत्र विवरण' : 'Mantra Details',
            detailText,
            [{ text: 'OK' }]
        );
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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isHindi ? 'जाप' : 'Chanting'}</Text>

                <TouchableOpacity onPress={handleReset}>
                    <Text style={{ color: '#BCAAA4', fontSize: 16, fontWeight: 'bold' }}>
                        {t.reset}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Mantra Text */}
                <View style={styles.mantraContainer}>
                    {/* Show Title if not Hindi (since Hindi uses sans as title usually) or separate transliteration */}
                    {!isHindi && <Text style={styles.titleText}>{mantra.title}</Text>}
                    <Text style={styles.sanskritText}>{mantra.sans}</Text>
                    <Text style={styles.meaningText} numberOfLines={2}>
                        {isHindi ? mantra.benefit.hi : mantra.benefit.en}
                    </Text>
                    <TouchableOpacity onPress={handleInfo} style={{ marginTop: 5 }}>
                        <Text style={{ color: '#4FC3F7', fontSize: 12, fontWeight: 'bold' }}>
                            {isHindi ? 'और पढ़ें... (Read More)' : 'Read More...'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Counter Display */}
                <View style={styles.monitorContainer}>
                    <Text style={styles.countBig}>{count}</Text>
                    <Text style={styles.targetSmall}>/ {target}</Text>
                </View>

                {/* Big Button */}
                <TouchableWithoutFeedback onPress={handlePress}>
                    <View style={styles.buttonWrapper}>
                        <View style={styles.rippleContainer}>
                            <Animated.View style={[styles.ripple, rippleStyle]} />
                        </View>

                        <Animated.View style={[styles.mainButton, buttonStyle]}>
                            {/* <Text style={styles.beadText}>🕉️</Text> */}
                            <Text style={styles.tapText}>{t.tapToCount}</Text>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 50
    },
    mantraContainer: {
        paddingHorizontal: 30,
        alignItems: 'center',
        marginTop: 20
    },
    titleText: {
        color: '#FFD700',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8
    },
    sanskritText: {
        color: '#FFB74D',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 10
    },
    meaningText: {
        color: '#B0BEC5',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    monitorContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    countBig: {
        fontSize: 80,
        color: '#FFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(255, 215, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20
    },
    targetSmall: {
        fontSize: 24,
        color: '#8D6E63',
        marginTop: -10
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 320,
        height: 320,
    },
    rippleContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
        position: 'absolute'
    },
    mainButton: {
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#BF360C', // Deep Prayer Beads Color
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFD700',
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10
    },
    beadText: {
        fontSize: 80,
        marginBottom: 10
    },
    tapText: {
        color: '#FFF',
        fontSize: 24, // Increased size
        opacity: 0.9,
        fontWeight: 'bold'
    }
});

export default ChantingScreen;

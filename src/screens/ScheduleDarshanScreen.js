import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const SPIRITUAL_TIPS = [
    "Performing puja during Brahma Muhurta (4:00 AM - 6:00 AM) is most auspicious.",
    "Lighting a Diya brings positive energy and removes darkness from mind.",
    "Chanting 'Om Namo Bhagavate Vasudevaya' 108 times daily brings peace.",
    "Offer fresh flowers to the Lord to express your pure devotion.",
    "Meditation on Shri Krishna's form helps in achieving mental clarity.",
    "Always start your day with a small prayer of gratitude.",
    "Sharing Prasad with others multiplies the blessings received."
];

const ScheduleDarshanScreen = () => {
    const navigation = useNavigation();

    // Reminder States
    const [morningEnabled, setMorningEnabled] = useState(false);
    const [morningTime, setMorningTime] = useState(() => {
        const d = new Date();
        d.setHours(6, 0, 0, 0);
        return d;
    });

    const [eveningEnabled, setEveningEnabled] = useState(false);
    const [eveningTime, setEveningTime] = useState(() => {
        const d = new Date();
        d.setHours(19, 0, 0, 0);
        return d;
    });

    const [showPicker, setShowPicker] = useState(null); // 'morning' or 'evening'

    // Streak Tracker States
    const [challengeDays, setChallengeDays] = useState(7);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Tip State
    const [tipIndex, setTipIndex] = useState(0);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadSettings();
        // Load some metadata like current streak from main AsyncStorage if available
        const getStreak = async () => {
            const s = await AsyncStorage.getItem('currentStreak');
            if (s) setCurrentStreak(parseInt(s));
        };
        getStreak();
    }, []);

    const loadSettings = async () => {
        try {
            const mEnabled = await AsyncStorage.getItem('morning_enabled');
            const mTime = await AsyncStorage.getItem('morning_time');
            const eEnabled = await AsyncStorage.getItem('evening_enabled');
            const eTime = await AsyncStorage.getItem('evening_time');
            const cDays = await AsyncStorage.getItem('challenge_days');

            if (mEnabled !== null) setMorningEnabled(mEnabled === 'true');
            if (mTime !== null) setMorningTime(new Date(mTime));
            if (eEnabled !== null) setEveningEnabled(eEnabled === 'true');
            if (eTime !== null) setEveningTime(new Date(eTime));
            if (cDays !== null) setChallengeDays(parseInt(cDays));
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem('morning_enabled', morningEnabled.toString());
            await AsyncStorage.setItem('morning_time', morningTime.toISOString());
            await AsyncStorage.setItem('evening_enabled', eveningEnabled.toString());
            await AsyncStorage.setItem('evening_time', eveningTime.toISOString());
            await AsyncStorage.setItem('challenge_days', challengeDays.toString());

            // Reschedule all based on new settings
            await rescheduleAllNotifications();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const rescheduleAllNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        await Notifications.cancelAllScheduledNotificationsAsync();

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('daily-puja', {
                name: 'Daily Puja Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });
        }

        if (morningEnabled) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Morning Darshan 🌅",
                    body: "Good morning! Start your day with Shri Krishna's blessing.",
                    sound: true,
                    channelId: 'daily-puja',
                },
                trigger: {
                    hour: morningTime.getHours(),
                    minute: morningTime.getMinutes(),
                    repeats: true,
                    channelId: 'daily-puja',
                },
            });
        }

        if (eveningEnabled) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Evening Darshan 🌇",
                    body: "End your day with peace. It's time for Evening Puja.",
                    sound: true,
                    channelId: 'daily-puja',
                },
                trigger: {
                    hour: eveningTime.getHours(),
                    minute: eveningTime.getMinutes(),
                    repeats: true,
                    channelId: 'daily-puja',
                },
            });
        }
    };

    // Auto-save when toggles change
    useEffect(() => {
        if (isLoaded) {
            saveSettings();
        }
    }, [morningEnabled, eveningEnabled, challengeDays, isLoaded]);

    const onTimeChange = (event, selectedDate) => {
        if (!selectedDate) {
            setShowPicker(null);
            return;
        }

        setShowPicker(null);
        if (showPicker === 'morning') {
            setMorningTime(selectedDate);
        } else if (showPicker === 'evening') {
            setEveningTime(selectedDate);
        }
        // Save will trigger on next state flush or we can call it
        setTimeout(saveSettings, 100);
    };

    const rotateTip = () => {
        setTipIndex((prev) => (prev + 1) % SPIRITUAL_TIPS.length);
    };

    const renderStreakIcons = () => {
        const icons = [];
        // Scale for up to 365 days
        let size = 35;
        if (challengeDays > 150) size = 18;
        else if (challengeDays > 66) size = 22;
        else if (challengeDays > 40) size = 26;
        else if (challengeDays > 21) size = 30;

        for (let i = 1; i <= challengeDays; i++) {
            const isCompleted = i <= currentStreak;
            icons.push(
                <View
                    key={i}
                    style={[
                        styles.streakIcon,
                        isCompleted && styles.streakIconActive,
                        { width: size, height: size + 5 }
                    ]}
                >
                    <Text style={{ fontSize: size * 0.5 }}>{isCompleted ? '🌸' : '⚪'}</Text>
                    <Text style={[styles.streakDayText, { fontSize: size * 0.25 }]}>{i}</Text>
                </View>
            );
        }
        return icons;
    };

    return (
        <ImageBackground
            source={{ uri: 'https://m.media-amazon.com/images/I/61k71BV8B3L._AC_UF1000,1000_QL80_.jpg' }}
            style={styles.background}
            blurRadius={10}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Spiritual Planner</Text>
                </View>

                {/* 1. Morning/Evening Reminders */}
                <View style={styles.remindersRow}>
                    <View style={[styles.card, styles.reminderCard]}>
                        <View style={styles.reminderHeader} pointerEvents="box-none">
                            <Text style={styles.reminderTitle}>Morning</Text>
                            <Switch
                                value={morningEnabled}
                                onValueChange={setMorningEnabled}
                                trackColor={{ false: "#ccc", true: "#CD9730" }}
                            />
                        </View>
                        <TouchableOpacity
                            disabled={!morningEnabled}
                            onPress={() => setShowPicker('morning')}
                            style={[styles.timeButton, !morningEnabled && { opacity: 0.5 }]}
                        >
                            <Text style={styles.timeText}>
                                {morningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.card, styles.reminderCard]}>
                        <View style={styles.reminderHeader} pointerEvents="box-none">
                            <Text style={styles.reminderTitle}>Evening</Text>
                            <Switch
                                value={eveningEnabled}
                                onValueChange={setEveningEnabled}
                                trackColor={{ false: "#ccc", true: "#CD9730" }}
                            />
                        </View>
                        <TouchableOpacity
                            disabled={!eveningEnabled}
                            onPress={() => setShowPicker('evening')}
                            style={[styles.timeButton, !eveningEnabled && { opacity: 0.5 }]}
                        >
                            <Text style={styles.timeText}>
                                {eveningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Daily Spiritual Tip */}
                <TouchableOpacity style={styles.card} onPress={rotateTip}>
                    <View style={styles.tipHeader}>
                        <Ionicons name="sparkles" size={20} color="#CD9730" />
                        <Text style={styles.tipTitle}>Daily Spiritual Tip</Text>
                        <Text style={{ fontSize: 10, color: '#999' }}>Click to change</Text>
                    </View>
                    <Text style={styles.tipText}>"{SPIRITUAL_TIPS[tipIndex]}"</Text>
                </TouchableOpacity>

                {/* 3. Streak Tracker / Challenge */}
                <View style={[styles.card, styles.fixedChallengeCard]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>My {challengeDays}-Day Challenge</Text>
                        <View style={styles.challengeControls}>
                            <TouchableOpacity
                                onPress={() => setChallengeDays(Math.max(7, challengeDays - 7))}
                                style={[styles.miniBtn, challengeDays <= 7 && { opacity: 0.3 }]}
                                disabled={challengeDays <= 7}
                            >
                                <Text style={styles.miniBtnText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setChallengeDays(challengeDays + 7 > 365 ? 365 : challengeDays + 7)}
                                style={[styles.miniBtn, challengeDays >= 365 && { opacity: 0.3 }]}
                                disabled={challengeDays >= 365}
                            >
                                <Text style={styles.miniBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.streakSub}>Keep your devotion consistent to bloom every morning.</Text>

                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        <View style={styles.streakGrid}>
                            {renderStreakIcons()}
                        </View>
                        <View style={{ height: 10 }} />
                    </ScrollView>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={showPicker === 'morning' ? morningTime : eveningTime}
                        mode="time"
                        is24Hour={false}
                        onChange={onTimeChange}
                    />
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Success is a collection of small daily efforts. 🙏
                    </Text>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 20,
        marginVertical: 8,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5
    },
    fixedChallengeCard: {
        flex: 1, // Let this card fill remaining space
        maxHeight: 320, // Increased from 280
        paddingBottom: 5,
    },
    scrollArea: {
        flex: 1,
        marginTop: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    challengeControls: { flexDirection: 'row', gap: 20 },
    miniBtn: { backgroundColor: '#CD9730', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    miniBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#5e3a0e' },
    streakSub: { fontSize: 12, color: '#666', marginBottom: 10, marginTop: 2 },
    streakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
    streakIcon: { alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWeight: 1, borderColor: '#eee' },
    streakIconActive: { backgroundColor: '#FFF5E1' },
    streakDayText: { color: '#999', marginTop: 1 },
    remindersRow: { flexDirection: 'row', paddingHorizontal: 10 },
    reminderCard: { flex: 1, marginHorizontal: 10, padding: 15 },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    reminderTitle: { fontSize: 16, fontWeight: 'bold', color: '#5e3a0e' },
    timeButton: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10, alignItems: 'center' },
    timeText: { fontSize: 18, color: '#CD9730', fontWeight: 'bold' },
    tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#8b0000', flex: 1 },
    tipText: { fontSize: 15, color: '#444', fontStyle: 'italic', lineHeight: 20, textAlign: 'center' },
    footer: { position: 'absolute', bottom: 100, left: 20, right: 20, alignItems: 'center' },
    footerText: { color: '#fff', textAlign: 'center', fontSize: 18, opacity: 0.8, fontStyle: 'italic' }
});

export default ScheduleDarshanScreen;

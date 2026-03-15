import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Initializes notification permissions and Android channel
 */
export const initNotifications = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('[Notifications] Permission not granted.');
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('darshan-alerts', {
                name: 'Darshan Alerts',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF9933',
                sound: 'default',
            });
        }

        return true;
    } catch (error) {
        console.error('[Notifications] Error during init:', error);
        return false;
    }
};

/**
 * Schedules daily recurring notifications for 7 AM and 4 PM (IST).
 * Uses explicit 'daily' trigger type required by expo-notifications v0.29.x.
 */
export const scheduleDailyRituals = async () => {
    try {
        // Cancel any old/stale notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // 1. Morning Darshan — 7:00 AM
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'जय श्री कृष्णा! 🙏 / Jai Sri Krishna! 🙏',
                body: 'प्रभात दर्शन तैयार है। / Prabhat Darshan is ready. 🙏',
                sound: 'default',
                channelId: 'darshan-alerts',
            },
            trigger: {
                type: 'daily',
                hour: 7,
                minute: 0,
            },
        });

        // 2. Evening Darshan — 4:00 PM (16:00)
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'जय श्री कृष्णा! 🙏 / Jai Sri Krishna! 🙏',
                body: 'संध्या दर्शन का समय हो गया है। / It\'s time for Sandhya Darshan. 🙏',
                sound: 'default',
                channelId: 'darshan-alerts',
            },
            trigger: {
                type: 'daily',
                hour: 17,
                minute: 0,
            },
        });

        const all = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`[Notifications] Scheduled ${all.length} notifications successfully.`);
    } catch (error) {
        console.error('[Notifications] Error scheduling rituals:', error);
    }
};

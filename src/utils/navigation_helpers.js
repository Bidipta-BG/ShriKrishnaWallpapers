
import { Alert } from 'react-native';

const OFFLINE_TRANSLATIONS = {
    en: {
        offlineTitle: 'No Internet Connection',
        offlineMsg: 'You are currently offline. Please connect to the internet to access this feature.',
        ok: 'OK',
        loading: 'Loading...'
    },
    hi: {
        offlineTitle: 'इंटरनेट कनेक्शन नहीं है',
        offlineMsg: 'आप वर्तमान में ऑफ़लाइन हैं। इस सुविधा का उपयोग करने के लिए कृपया इंटरनेट से जुड़ें।',
        ok: 'ठीक है',
        loading: 'लोड हो रहा है...'
    }
};

/**
 * Checks for internet connectivity and performs navigation if online.
 * Displays a loading overlay during the check and an alert if offline.
 */
export const handleProtectedNavigation = async ({
    navigation,
    screen,
    params = {},
    language = 'en',
    showLoading,
    hideLoading,
    disabled = false
}) => {
    if (disabled) return;

    const t = OFFLINE_TRANSLATIONS[language] || OFFLINE_TRANSLATIONS.en;

    if (showLoading) showLoading(t.loading);

    try {
        // Connectivity check via a light GET request
        const response = await fetch('https://api.thevibecoderagency.online/api/Health', {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
        }).catch(() => null);

        if (response && response.status >= 200 && response.status < 400) {
            // Online - navigate
            if (screen === 'Gallery') {
                navigation.navigate('Gallery');
                navigation.navigate('FullImage');
            } else {
                navigation.navigate(screen, params);
            }

            if (hideLoading) {
                // Short delay to allow screen to mount before hiding overlay
                setTimeout(() => hideLoading(), 300);
            }
        } else {
            if (hideLoading) hideLoading();
            throw new Error('Offline');
        }
    } catch (error) {
        if (hideLoading) hideLoading();
        Alert.alert(
            t.offlineTitle,
            t.offlineMsg,
            [{ text: t.ok }]
        );
    }
};

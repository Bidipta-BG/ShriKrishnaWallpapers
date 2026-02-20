import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useLoading } from '../contexts/LoadingContext';

const NAV_TRANSLATIONS = {
    en: {
        images: 'Images',
        astro: 'Astro',
        puja: 'Puja',
        samagri: 'Samagri',
        more: 'More',
        offlineTitle: 'No Internet Connection',
        offlineMsg: 'You are currently offline. Please connect to the internet to access the divine gallery and features.',
        ok: 'OK'
    },
    hi: {
        images: 'चित्र',
        astro: 'एस्ट्रो',
        puja: 'पूजा',
        samagri: 'सामग्री',
        more: 'अधिक',
        offlineTitle: 'इंटरनेट कनेक्शन नहीं है',
        offlineMsg: 'आप वर्तमान में ऑफ़लाइन हैं। दिव्य गैलरी और सुविधाओं का उपयोग करने के लिए कृपया इंटरनेट से जुड़ें।',
        ok: 'ठीक है'
    }
};

const BottomNav = ({ navigation, activeTab, disabled }) => {
    const { showLoading, hideLoading } = useLoading();
    const { language } = useLanguage();
    const t = NAV_TRANSLATIONS[language] || NAV_TRANSLATIONS.en;

    const handleProtectedNavigation = async (screen, params = {}) => {
        if (disabled) return;
        showLoading('Loading...');
        // Simple connectivity check using a HEAD request to the API
        // This is fast and doesn't download large data.
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/Health', {
                method: 'GET', // Using GET as some servers don't like HEAD, but keep it minimal
                headers: { 'Cache-Control': 'no-cache' }
            }).catch(() => null);

            if (response && response.status >= 200 && response.status < 400) {
                // Online, proceed to navigation
                if (screen === 'Gallery') {
                    navigation.navigate('Gallery');
                    navigation.navigate('FullImage');
                } else {
                    navigation.navigate(screen, params);
                }
                // Hide loading after a short delay to allow screen to mount
                setTimeout(() => hideLoading(), 300);
            } else {
                hideLoading();
                throw new Error('Offline');
            }
        } catch (error) {
            // Offline or network error
            hideLoading();
            Alert.alert(
                t.offlineTitle,
                t.offlineMsg,
                [{ text: t.ok }]
            );
        }
    };

    return (
        <View style={styles.bottomNavContainer}>
            {/* Progress Bar (Subtle tech line) */}
            <View style={styles.techProgressBar} />

            <View style={[styles.navBar, disabled && { opacity: 0.6 }]}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Gallery')}
                    disabled={disabled}
                >
                    <Ionicons
                        name={activeTab === 'Image' ? 'images' : 'images-outline'}
                        size={24}
                        color={activeTab === 'Image' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Image' && { color: '#9c6ce6' }]}>{t.images}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Astro')}
                    disabled={disabled}
                >
                    <Ionicons
                        name={activeTab === 'Astro' ? 'planet' : 'planet-outline'}
                        size={24}
                        color={activeTab === 'Astro' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Astro' && { color: '#9c6ce6' }]}>{t.astro}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => !disabled && navigation.navigate('DailyDarshan')}
                    disabled={disabled}
                >
                    {activeTab === 'Puja' && <View style={styles.pujaActiveIndicator} />}
                    <Ionicons
                        name={activeTab === 'Puja' ? 'flower' : 'flower-outline'}
                        size={26}
                        color={activeTab === 'Puja' ? '#4dabf7' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Puja' && { color: '#4dabf7' }]}>{t.puja}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Samagri')}
                    disabled={disabled}
                >
                    <Ionicons
                        name={activeTab === 'Samagri' ? 'cart' : 'cart-outline'}
                        size={24}
                        color={activeTab === 'Samagri' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Samagri' && { color: '#9c6ce6' }]}>{t.samagri}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => !disabled && navigation.navigate('Settings')}
                    disabled={disabled}
                >
                    {/* Settings/More tab */}
                    <Ionicons
                        name={activeTab === 'Settings' ? 'settings' : 'settings-outline'}
                        size={24}
                        color={activeTab === 'Settings' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Settings' && { color: '#9c6ce6' }]}>{t.more}</Text>
                </TouchableOpacity>
            </View>

            {/* Safe Area Spacer */}
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#000' }} />
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNavContainer: {
        backgroundColor: '#000',
    },
    techProgressBar: {
        width: '100%',
        height: 2,
        backgroundColor: '#4dabf7', // Neon blue
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
        backgroundColor: '#000',
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
    activeNavLabel: {
        color: '#9c6ce6',
    },
    pujaActiveIndicator: {
        position: 'absolute',
        top: -10,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4dabf7',
    },
});

export default BottomNav;

import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BottomNav = ({ navigation, activeTab }) => {

    const handleProtectedNavigation = async (screen, params = {}) => {
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
            } else {
                throw new Error('Offline');
            }
        } catch (error) {
            // Offline or network error
            Alert.alert(
                "No Internet Connection",
                "You are currently offline. Please connect to the internet to access the divine gallery and features.",
                [{ text: "OK" }]
            );
        }
    };

    return (
        <View style={styles.bottomNavContainer}>
            {/* Progress Bar (Subtle tech line) */}
            <View style={styles.techProgressBar} />

            <View style={styles.navBar}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Gallery')}
                >
                    <Ionicons
                        name={activeTab === 'Image' ? 'images' : 'images-outline'}
                        size={24}
                        color={activeTab === 'Image' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Image' && { color: '#9c6ce6' }]}>Images</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Generate')}
                >
                    <Ionicons
                        name={activeTab === 'Astro' ? 'planet' : 'planet-outline'}
                        size={24}
                        color={activeTab === 'Astro' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Astro' && { color: '#9c6ce6' }]}>Astro</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('DailyDarshan')}>
                    {activeTab === 'Puja' && <View style={styles.pujaActiveIndicator} />}
                    <Ionicons
                        name={activeTab === 'Puja' ? 'flower' : 'flower-outline'}
                        size={26}
                        color={activeTab === 'Puja' ? '#4dabf7' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Puja' && { color: '#4dabf7' }]}>Puja</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleProtectedNavigation('Samagri')}
                >
                    <Ionicons
                        name={activeTab === 'Samagri' ? 'cart' : 'cart-outline'}
                        size={24}
                        color={activeTab === 'Samagri' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Samagri' && { color: '#9c6ce6' }]}>Samagri</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
                    {/* Settings/More tab */}
                    <Ionicons
                        name={activeTab === 'Settings' ? 'settings' : 'settings-outline'}
                        size={24}
                        color={activeTab === 'Settings' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Settings' && { color: '#9c6ce6' }]}>More</Text>
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

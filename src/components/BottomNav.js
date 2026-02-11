import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BottomNav = ({ navigation, activeTab }) => {
    return (
        <View style={styles.bottomNavContainer}>
            {/* Progress Bar (Subtle tech line) */}
            <View style={styles.techProgressBar} />

            <View style={styles.navBar}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {
                        navigation.navigate('Gallery');
                        navigation.navigate('FullImage');
                    }}
                >
                    <Ionicons
                        name={activeTab === 'Image' ? 'images' : 'images-outline'}
                        size={24}
                        color={activeTab === 'Image' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Image' && { color: '#9c6ce6' }]}>Images</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Generate')}>
                    <Ionicons
                        name={activeTab === 'Generate' ? 'color-palette' : 'color-palette-outline'}
                        size={24}
                        color={activeTab === 'Generate' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Generate' && { color: '#9c6ce6' }]}>Generate</Text>
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

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Reels')}>
                    <Ionicons
                        name={activeTab === 'Reels' ? 'videocam' : 'videocam-outline'}
                        size={24}
                        color={activeTab === 'Reels' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Reels' && { color: '#9c6ce6' }]}>Reels</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Saved')}>
                    <Ionicons
                        name={activeTab === 'Saved' ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color={activeTab === 'Saved' ? '#9c6ce6' : '#FFF'}
                    />
                    <Text style={[styles.navLabel, activeTab === 'Saved' && { color: '#9c6ce6' }]}>Saved</Text>
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

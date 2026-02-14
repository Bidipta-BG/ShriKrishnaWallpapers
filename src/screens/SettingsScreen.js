import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [coins, setCoins] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadCoins();
        }, [])
    );

    const loadCoins = async () => {
        try {
            const storedCoins = await AsyncStorage.getItem('divyaCoins');
            if (storedCoins) {
                setCoins(parseInt(storedCoins));
            }
        } catch (error) {
            console.error('Error loading coins:', error);
        }
    };

    const handleBuy = () => {
        Alert.alert('Coming Soon', 'Payments are being integrated.');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#9c6ce6" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Remove Ads Card */}
                <LinearGradient
                    colors={['#1a1a1a', '#2d2d2d']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircleRed}>
                            <Text style={styles.adsIconText}>ADS</Text>
                            <View style={styles.strikeThrough} />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>Remove Ads – Lifetime</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.price}>₹49.00</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tagText}>One-time payment</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#9c6ce6" />
                            <Text style={styles.featureText}>Clean & distraction-free experience</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#9c6ce6" />
                            <Text style={styles.featureText}>Remove ads forever</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#9c6ce6" />
                            <Text style={styles.featureText}>No subscriptions</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                        <Text style={styles.buyButtonText}>BUY</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Coins Card */}
                <View style={[styles.card, styles.coinsCard]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet" size={40} color="#D4AF37" style={{ marginRight: 15 }} />
                        <View>
                            <Text style={styles.cardTitle}>Your Coins</Text>
                            <Text style={styles.coinBalance}>{coins}</Text>
                        </View>
                    </View>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFA500" />
                            <Text style={styles.featureText}>Generate God Images Using AI</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFA500" />
                            <Text style={styles.featureText}>Generate Child With God Images Using AI</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#4caf50' }]} onPress={handleBuy}>
                        <Text style={styles.buyButtonText}>BUY</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 15,
        // borderBottomWidth: 1,
        // borderBottomColor: '#1A1A1A',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#9c6ce6', // Purple title as in screenshot
        textAlign: 'center',
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center', // Align properly
        marginBottom: 15,
    },
    iconCircleRed: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ff4444',
        marginRight: 15,
        position: 'relative',
    },
    adsIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    strikeThrough: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#ff4444',
        transform: [{ rotate: '-45deg' }],
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    price: {
        color: '#c490ff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    tagContainer: {
        backgroundColor: '#3d2b4d',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#c490ff',
        fontSize: 10,
        fontWeight: '600',
    },
    featuresList: {
        gap: 10,
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    featureText: {
        color: '#ddd',
        fontSize: 13,
        flex: 1,
        lineHeight: 20,
    },
    buyButton: {
        backgroundColor: '#4caf50', // Green
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 30,
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    coinsCard: {
        backgroundColor: '#1a1a10', // Slight gold tint bg
        borderColor: '#333',
    },
    coinBalance: {
        color: '#ffd700',
        fontSize: 24,
        fontWeight: 'bold',
    },
    settingsList: {
        marginTop: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        // borderBottomWidth: 1,
        // borderBottomColor: '#1A1A1A',
        backgroundColor: '#111',
        marginBottom: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingText: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
        fontWeight: '500',
    },
    versionText: {
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
    },
});

export default SettingsScreen;

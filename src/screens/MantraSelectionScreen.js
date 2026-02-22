import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';

// --- Dummy Data ---
const FALLBACK_MANTRA = [
    {
        id: '1',
        title: 'Om Shri Vardhanaya Namah',
        sans: 'ॐ श्री वर्धनाय नमः',
        benefit: {
            en: 'For success in career and growth.',
            hi: 'करियर में सफलता और वृद्धि के लिए।'
        },
        details: {
            en: "Chanting this mantra 108 times is believed to remove obstacles in your professional life.",
            hi: "इस मंत्र का 108 बार जाप करने से व्यावसायिक जीवन में आने वाली बाधाएं दूर होती हैं।"
        },
        count: 108
    }
];

const TRANSLATIONS = {
    en: {
        title: 'Select a Mantra',
        startChanting: 'Start Chanting',
        times: 'times'
    },
    hi: {
        title: 'मंत्र चुनें',
        startChanting: 'jaap शुरू करें',
        times: 'बार'
    }
};

const MantraSelectionScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    const [mantras, setMantras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMantras();
    }, []);

    const fetchMantras = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/mantras');
            const result = await response.json();
            if (result.success) {
                setMantras(result.data);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (e) {
            console.error('Mantra fetch error:', e);
            setError(isHindi ? 'मंत्र लोड करने में विफल' : 'Failed to load mantras');
            setMantras(FALLBACK_MANTRA);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Chanting', { mantra: item })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.mantraTitle}>{isHindi ? item.sans : item.title}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{item.count}</Text>
                    </View>
                </View>

                <Text style={styles.sanskritText}>{item.sans}</Text>

                <View style={styles.divider} />

                <Text style={styles.benefitText}>
                    ✨ {isHindi ? item.benefit.hi : item.benefit.en}
                </Text>

                <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>{t.startChanting} →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={50} color="#D35400" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchMantras}>
                        <Text style={styles.retryBtnText}>{isHindi ? 'पुनः प्रयास करें' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={mantras}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        borderBottomWidth: 1,
        borderBottomColor: '#3E2723',
        backgroundColor: '#1A120B'
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    listContent: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#2C1B10',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#5D4037',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10
    },
    mantraTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10
    },
    countBadge: {
        backgroundColor: '#4E342E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#8D6E63'
    },
    countText: {
        color: '#FFCC80',
        fontSize: 12,
        fontWeight: 'bold'
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 22,
        textAlign: 'center',
        marginVertical: 10,
        fontFamily: 'serif',
        lineHeight: 32
    },
    divider: {
        height: 1,
        backgroundColor: '#5D4037',
        marginVertical: 12
    },
    benefitText: {
        color: '#BCAAA4',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 15
    },
    startBtn: {
        backgroundColor: '#E65100', // Deep Orange
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5
    },
    startBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        color: '#D35400',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        fontFamily: 'serif'
    },
    retryBtn: {
        marginTop: 20,
        backgroundColor: '#3E2723',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    retryBtnText: {
        color: '#FFD700',
        fontWeight: 'bold'
    }
});

export default MantraSelectionScreen;

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const DailySlokaShareScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const isHindi = language === 'hi';
    const { backgroundImage } = route.params || {};

    const viewRef = useRef();
    const [sloka, setSloka] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [showBranding, setShowBranding] = useState(true);

    useEffect(() => {
        fetchDailySloka();
    }, []);

    const fetchDailySloka = async () => {
        try {
            // 1. Fetch Granth List
            const bookRes = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/granth');
            const books = await bookRes.json();
            const bookId = books[0]?.id || 'bg';

            // 2. Fetch specific Granth Structure
            const structureRes = await fetch(`https://api.thevibecoderagency.online/api/srikrishna-aarti/granth/${bookId}`);
            const structure = await structureRes.json();

            // 3. Pick a random verse
            const chapters = structure.chapters || [];
            const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
            const verses = randomChapter?.verses || [];
            const randomVerse = verses[Math.floor(Math.random() * verses.length)];

            if (randomVerse) {
                // 4. Fetch full verse details
                const detailRes = await fetch(`https://api.thevibecoderagency.online/api/srikrishna-aarti/granth/verse/${randomVerse.id}`);
                const verseDetail = await detailRes.json();
                setSloka(verseDetail);
            }
        } catch (error) {
            console.error('Error fetching Granth Wisdom:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            const uri = await captureRef(viewRef, {
                format: 'jpg',
                quality: 0.9,
                result: 'tmpfile',
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/jpeg',
                dialogTitle: 'Share Daily Darshan',
                UTI: 'public.jpeg',
            });
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Error', 'Failed to generate shareable image.');
        } finally {
            setIsSharing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    const slokaContent = language === 'hi' ? sloka?.hi : sloka?.en;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{language === 'hi' ? 'ग्रंथ आशीर्वाद' : 'Granth Wisdom'}</Text>
            </View>

            {/* Capturable View */}
            <View style={styles.captureContainer} ref={viewRef} collapsable={false}>
                <Image source={{ uri: backgroundImage }} style={styles.bgImage} resizeMode="cover" />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.slokaBox}>
                        <Text style={styles.sanskritText}>{sloka?.sans}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.translationText}>{slokaContent?.text}</Text>
                        <Text style={styles.verseCitation}>
                            — {isHindi ? sloka?.chapterHi : sloka?.chapter}
                        </Text>

                        {showBranding && (
                            <View style={styles.brandingRow}>
                                <Ionicons name="logo-google-playstore" size={20} color="#FFD700" style={{ marginRight: 8 }} />
                                <Text style={styles.brandingText}>Sri Krishna Puja App</Text>
                                {!isSharing && (
                                    <TouchableOpacity
                                        onPress={() => setShowBranding(false)}
                                        style={styles.closeBranding}
                                    >
                                        <Ionicons name="close-circle" size={18} color="rgba(255,215,0,0.6)" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={isSharing}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA000']}
                        style={styles.shareGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {isSharing ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Ionicons name="share-social" size={24} color="#000" />
                                <Text style={styles.shareText}>{language === 'hi' ? 'ग्रंथ आशीर्वाद' : 'Wisdom'}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 15,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    captureContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: 25,
        paddingBottom: 140,
    },
    slokaBox: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    sanskritText: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 30,
        fontFamily: 'serif',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,215,0,0.2)',
        marginVertical: 15,
        width: '50%',
        alignSelf: 'center',
    },
    translationText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        fontStyle: 'italic',
        marginBottom: 10
    },
    verseCitation: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        opacity: 0.8,
        fontStyle: 'italic'
    },
    brandingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        opacity: 0.8,
    },
    logoCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD700',
        marginRight: 8,
    },
    logoText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
    },
    brandingText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    closeBranding: {
        marginLeft: 10,
        padding: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
    },
    shareButton: {
        height: 55,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    shareGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    shareText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DailySlokaShareScreen;

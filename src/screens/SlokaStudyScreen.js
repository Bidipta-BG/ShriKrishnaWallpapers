import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { GRANTH_LIBRARY_DATA } from '../data/SlokaLibraryData';
import { loadUserCoins, saveUserCoins } from '../utils/samagri_helpers';
import { completeVerse, loadSlokaProgress } from '../utils/sloka_helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SlokaStudyScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { verse, book, chapterId } = route.params;
    const { language } = useLanguage();
    const isHindi = language === 'hi';
    const content = isHindi ? verse.hi : verse.en;

    const [timeLeft, setTimeLeft] = useState(null); // Use null to indicate loading
    const [isComplete, setIsComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [rewardEarned, setRewardEarned] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        meaning: true,
        understanding: false,
        lessons: false
    });

    useEffect(() => {
        const checkCompletion = async () => {
            try {
                const progress = await loadSlokaProgress();
                const alreadyDone = progress.completedVerses.includes(verse.id);

                if (alreadyDone) {
                    setTimeLeft(0);
                    setIsComplete(true);
                    setRewardEarned(true);
                } else {
                    setTimeLeft(5); // Testing: 5 seconds instead of 180
                    setIsComplete(false);
                    setRewardEarned(false);
                }
            } catch (error) {
                console.error('Check completion error:', error);
                setTimeLeft(5);
            } finally {
                setIsLoading(false);
            }
        };
        checkCompletion();
    }, [verse.id]);

    useEffect(() => {
        if (isLoading || timeLeft === null) return;

        if (timeLeft <= 0) {
            setIsComplete(true);
            if (!rewardEarned) {
                handleAutoUnlock();
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, rewardEarned, isLoading]);

    const handleAutoUnlock = async () => {
        setRewardEarned(true);
        try {
            // Unlock next verse & chapter
            await completeVerse(verse.id, GRANTH_LIBRARY_DATA);

            // Add Reward Coins
            const currentCoins = await loadUserCoins();
            await saveUserCoins(currentCoins + 5);

            // Show Celebration
            setShowRewardModal(true);
        } catch (error) {
            console.error('Auto unlock error:', error);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleShare = async () => {
        try {
            const verseRef = isHindi ? verse.chapterHi : verse.chapter;
            const message = isHindi
                ? `मैंने अभी श्रीकृष्ण ऐप में ${verseRef} का अध्ययन पूर्ण किया और 5 दिव्य सिक्के कमाए! 🙏✨ आप भी श्रीमद्भगवद्गीता के गहन ज्ञान से जुड़ें: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`
                : `I just finished studying ${verseRef} in the Shri Krishna App and earned 5 Divya Coins! 🙏✨ Deepen your spiritual journey today: https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const toggleSection = (section) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderSection = (id, title, text, icon) => {
        const isExpanded = expandedSections[id];
        return (
            <View style={styles.sectionCard}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name={icon} size={20} color="#FFD700" />
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#BCAAA4"
                    />
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.sectionBody}>
                        <Text style={styles.sectionText}>{text}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>
                        {isHindi ? verse.chapterHi : verse.chapter}
                    </Text>
                    <Text style={styles.headerTitle}>
                        {isHindi ? 'गहन अध्ययन' : 'Deep Study'}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Sanskrit Verse */}
                <View style={styles.verseCard}>
                    <Ionicons name="ribbon-outline" size={32} color="#FFD700" style={styles.verseIcon} />
                    <Text style={styles.sanskritText}>{verse.sans}</Text>
                </View>

                {/* Main Translation */}
                <View style={styles.translationContainer}>
                    <Text style={styles.translationText}>{content.text}</Text>
                </View>

                {/* Deep Dive Sections */}
                {renderSection('meaning', isHindi ? 'सरल अर्थ' : 'Translation', content.meaning, 'book-outline')}
                {renderSection('understanding', isHindi ? 'गहन समझ' : 'Deep Understanding', content.explanation, 'bulb-outline')}
                {renderSection('lessons', isHindi ? 'जीवन के सबक' : 'Life Lessons', content.lessons, 'heart-outline')}

            </ScrollView>

            <View style={[
                styles.bottomBar,
                { paddingBottom: Math.max(insets.bottom, 20) }
            ]}>
                <View style={styles.timerRow}>
                    <Ionicons name="time-outline" size={20} color="#FFD700" />
                    <Text style={styles.timerText}>
                        {isComplete
                            ? (isHindi ? 'अध्ययन पूर्ण हुआ: 0:00' : 'Study Complete: 0:00')
                            : (isHindi ? `पूर्ण करने के लिए समय: ${formatTime(timeLeft)}` : `Time to complete: ${formatTime(timeLeft)}`)}
                    </Text>
                </View>
            </View>

            {/* Celebration Modal */}
            <Modal
                transparent={true}
                visible={showRewardModal}
                animationType="fade"
                onRequestClose={() => setShowRewardModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.rewardCard}>
                        <View style={styles.celebrationIconBox}>
                            <Ionicons name="star" size={50} color="#FFD700" />
                            <Ionicons name="sparkles" size={30} color="#FFA000" style={styles.sparkleIcon} />
                        </View>

                        <Text style={styles.congratsTitle}>
                            {isHindi ? 'बधाई हो!' : 'Congratulations!'}
                        </Text>

                        <Text style={styles.congratsSub}>
                            {isHindi
                                ? 'आपने सफलतापूर्वक इस श्लोक का अध्ययन पूर्ण कर लिया है।'
                                : 'You have successfully completed the study of this verse.'}
                        </Text>

                        <View style={styles.rewardInfoBox}>
                            <View style={styles.rewardItem}>
                                <Ionicons name="key" size={20} color="#FFD700" />
                                <Text style={styles.rewardItemText}>
                                    {isHindi ? 'अगला श्लोक खुल गया है' : 'Next Verse Unlocked'}
                                </Text>
                            </View>
                            <View style={styles.rewardItem}>
                                <View style={styles.coinCircle}>
                                    <Text style={styles.coinSymbol}>$</Text>
                                </View>
                                <Text style={styles.rewardItemText}>
                                    {isHindi ? '५ दिव्य सिक्के प्राप्त हुए' : 'Earned 5 Divya Coins'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.shareBtnModal}
                            onPress={handleShare}
                        >
                            <Ionicons name="share-social" size={20} color="#FFF" />
                            <Text style={styles.shareBtnTextModal}>
                                {isHindi ? 'उपलब्धि साझा करें' : 'Share Achievement'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.appLinkText}>
                            https://play.google.com/store/apps/details?id=com.thevibecoder.shrikrishnadailypujaaarti
                        </Text>

                        <TouchableOpacity
                            style={styles.modalOkBtn}
                            onPress={() => setShowRewardModal(false)}
                        >
                            <Text style={styles.modalOkBtnText}>{isHindi ? 'ठीक है' : 'OK'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
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
    headerTitleContainer: {
        alignItems: 'center'
    },
    headerSubtitle: {
        color: '#B0BEC5',
        fontSize: 10,
        textTransform: 'uppercase'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120
    },
    verseCard: {
        backgroundColor: '#2C1B10',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD700',
        marginBottom: 25,
        elevation: 10,
        shadowColor: '#FFD700',
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    verseIcon: {
        marginBottom: 15
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 36,
        fontFamily: 'serif'
    },
    translationContainer: {
        marginBottom: 30,
        paddingHorizontal: 10
    },
    translationText: {
        color: '#FFB74D',
        fontSize: 18,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 28
    },
    sectionCard: {
        backgroundColor: '#1A120B',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#3E2723',
        overflow: 'hidden'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'rgba(255, 215, 0, 0.05)'
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold'
    },
    sectionBody: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#3E2723'
    },
    sectionText: {
        color: '#EFEBE9',
        fontSize: 15,
        lineHeight: 24
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(26, 18, 11, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#3E2723'
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    timerText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold'
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    rewardCard: {
        backgroundColor: '#1A120B',
        width: '90%',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        elevation: 20,
        shadowColor: '#FFD700',
        shadowOpacity: 0.3,
        shadowRadius: 15
    },
    celebrationIconBox: {
        marginBottom: 20,
        position: 'relative'
    },
    sparkleIcon: {
        position: 'absolute',
        top: -10,
        right: -15
    },
    congratsTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
        fontFamily: 'serif'
    },
    congratsSub: {
        color: '#BCAAA4',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 25
    },
    rewardInfoBox: {
        width: '100%',
        backgroundColor: 'rgba(255,215,0,0.05)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
        gap: 12
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    rewardItemText: {
        color: '#EFEBE9',
        fontSize: 15,
        fontWeight: 'bold'
    },
    coinCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center'
    },
    coinSymbol: {
        color: '#1A120B',
        fontWeight: 'bold',
        fontSize: 16
    },
    shareBtnModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#2E7D32',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 15,
        marginBottom: 10
    },
    shareBtnTextModal: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    appLinkText: {
        color: '#BCAAA4',
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10
    },
    modalOkBtn: {
        backgroundColor: '#D35400',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3
    },
    modalOkBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default SlokaStudyScreen;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const TRANSLATIONS = {
    en: {
        title: 'Hand selection',
        photoReq: 'Photo Requirement',
        standardEx: 'Standard Example',
        warning: 'Photo that do not meet the requirement my affect the accuracy of the results',
        incomplete: 'Incomplete',
        tighten: 'Tighten',
        bending: 'Bending',
        jewelry: 'Jewelry',
        scan: 'Scan',
    },
    hi: {
        title: 'हाथ का चयन',
        photoReq: 'फोटो की आवश्यकता',
        standardEx: 'मानक उदाहरण',
        warning: 'जो फोटो आवश्यकता को पूरा नहीं करते हैं वे परिणामों की सटीकता को प्रभावित कर सकते हैं',
        incomplete: 'अधूरा',
        tighten: 'कसा हुआ',
        bending: 'मुड़ा हुआ',
        jewelry: 'आभूषण',
        scan: 'स्कैन करें',
    }
};

const HandAnalysisScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    const RequirementItem = ({ icon, label }) => (
        <View style={styles.reqItem}>
            <View style={styles.reqIconWrapper}>
                <Ionicons name={icon} size={24} color="#FFF" />
            </View>
            <Text style={styles.reqLabel}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity style={styles.crownButton}>
                    <Ionicons name="ribbon" size={24} color="#FFD700" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Main Requirement Section */}
                <View style={styles.requirementSection}>
                    <Text style={styles.sectionTitle}>{t.photoReq}</Text>

                    <View style={styles.focusGuideContainer}>
                        <View style={styles.focusCircle}>
                            {/* Representative Hand Icon / Placeholder */}
                            <Ionicons name="hand-left" size={100} color="#9c6ce644" />
                            {/* Focus Square Overlay */}
                            <View style={styles.focusSquare} />
                        </View>
                    </View>

                    <Text style={styles.standardExTitle}>{t.standardEx}</Text>
                    <Text style={styles.warningText}>{t.warning}</Text>

                    {/* Bad Examples Row */}
                    <View style={styles.badExRow}>
                        <RequirementItem icon="close-circle-outline" label={t.incomplete} />
                        <RequirementItem icon="contract-outline" label={t.tighten} />
                        <RequirementItem icon="refresh-outline" label={t.bending} />
                        <RequirementItem icon="sparkles-outline" label={t.jewelry} />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <TouchableOpacity style={styles.scanBtn} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#4dabf7', '#9c6ce6']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.scanGradient}
                    >
                        <Text style={styles.scanBtnText}>{t.scan}</Text>
                        <View style={styles.adBadge}>
                            <Ionicons name="play-circle" size={16} color="#FFF" />
                            <Text style={styles.adText}>AD</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <BottomNav navigation={navigation} activeTab="Astro" />
            </View>
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#0a0a0a',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    crownButton: {
        backgroundColor: '#1a1a1a',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    scrollContent: {
        paddingBottom: 150,
    },
    requirementSection: {
        flex: 1,
        backgroundColor: '#0a0a1a',
        padding: 25,
        paddingTop: 40,
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    focusGuideContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#1a1a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
        borderColor: '#333',
        overflow: 'hidden',
    },
    focusCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#9c6ce644',
    },
    focusSquare: {
        position: 'absolute',
        width: 60,
        height: 60,
        backgroundColor: '#9c6ce633',
        borderWidth: 1,
        borderColor: '#9c6ce6',
        borderRadius: 5,
    },
    standardExTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    warningText: {
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
        lineHeight: 18,
    },
    badExRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    reqItem: {
        alignItems: 'center',
        gap: 8,
    },
    reqIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1a1a40',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334',
    },
    reqLabel: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: '500',
    },
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
    },
    scanBtn: {
        marginHorizontal: 20,
        marginBottom: 15,
        height: 55,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 10,
    },
    scanGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    scanBtnText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    adBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 4,
    },
    adText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default HandAnalysisScreen;

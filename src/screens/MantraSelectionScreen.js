import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        startChanting: 'Chant',
        listenMantra: 'Listen',
        times: 'times',
        modal: {
            guidelines: 'Preparation Guidelines',
            note: 'Please sit in a quiet place, ensure you feel comfortable, and keep your spine straight before starting the Jhaap.',
            selectCount: 'Select Jhaap Count',
            customPlaceholder: 'Enter custom count',
            startBtn: 'Start Chanting',
            limitError: 'Maximum count allowed is 300',
            motivation: 'Complete this jhaap to earn 5 Divya Coins and divine blessings.'
        },
        listenModal: {
            title: 'Mantra Listening Prep',
            motivation: 'Complete this mantra listening to earn 5 Divya Coins and attain deep inner peace.',
            guidelines: 'Please listen in a quiet place with a clear and focused mind for the best experience.',
            warning: 'Note: If you go back before completion, your progress and rewards will be lost.',
            startBtn: 'Start Listening'
        }
    },
    hi: {
        title: 'मंत्र चुनें',
        startChanting: 'जाप',
        listenMantra: 'श्रवण',
        times: 'बार',
        modal: {
            guidelines: 'तैयारी के निर्देश',
            note: 'कृपया जाप शुरू करने से पहले एक शांत स्थान पर बैठें, सुनिश्चित करें कि आप सहज महसूस कर रहे हैं, और अपनी रीढ़ की हड्डी सीधी रखें।',
            selectCount: 'जाप संख्या चुनें',
            customPlaceholder: 'संख्या दर्ज करें',
            startBtn: 'जाप शुरू करें',
            limitError: 'अधिकतम संख्या 300 ही हो सकती है',
            motivation: '५ दिव्य सिक्के और ईश्वरीय आशीर्वाद अर्जित करने के लिए इस जाप को पूरा करें।'
        },
        listenModal: {
            title: 'मंत्र श्रवण की तैयारी',
            motivation: '५ दिव्य सिक्के अर्जित करने और गहरी आंतरिक शांति प्राप्त करने के लिए इस मंत्र श्रवण को पूरा करें।',
            guidelines: 'सर्वोत्तम अनुभव के लिए कृपया शांत स्थान पर स्पष्ट और केंद्रित मन से सुनें।',
            warning: 'नोट: यदि आप पूरा होने से पहले वापस जाते हैं, तो आपकी प्रगति और पुरस्कार खो जाएंगे।',
            startBtn: 'श्रवण शुरू करें'
        }
    }
};

const MantraSelectionScreen = ({ navigation }) => {
    const { language } = useLanguage();
    const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
    const isHindi = language === 'hi';

    const [mantras, setMantras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMantra, setSelectedMantra] = useState(null);
    const [selectedCount, setSelectedCount] = useState(108);
    const [customCount, setCustomCount] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [countError, setCountError] = useState('');
    const [listenModalVisible, setListenModalVisible] = useState(false);

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
                // Map API fields correctly
                const enrichedData = result.data.map(m => ({
                    ...m,
                    image: (m.image && m.image.trim() !== "") ? m.image : 'https://i.ibb.co/vzB7pLp/lord-krishna.png',
                    music: (m.music && m.music.trim() !== "") ? m.music : null
                }));
                setMantras(enrichedData);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (e) {
            console.error('Mantra fetch error:', e);
            setError(isHindi ? 'मंत्र लोड करने में विफल' : 'Failed to load mantras');

            // Comprehensive fallback data for testing
            setMantras([
                {
                    id: "6999a411a657477e766fd9b0",
                    title: "Om Namo Bhagavate Vasudevaya",
                    sans: "ॐ नमो भगवते वासुदेवाय",
                    benefit: {
                        en: "For spiritual liberation and peace.",
                        hi: "आध्यात्मिक मुक्ति और शांति के लिए।"
                    },
                    image: 'https://i.ibb.co/vzB7pLp/lord-krishna.png',
                    music: null
                },
                {
                    id: "6999a4d0a657477e766fd9b3",
                    title: "Om Namah Shivaya",
                    sans: "ॐ नमः शिवाय",
                    benefit: {
                        en: "For inner peace and transformation.",
                        hi: "आंतरिक शांति और परिवर्तन के लिए।"
                    },
                    image: 'https://i.ibb.co/vzB7pLp/lord-krishna.png',
                    music: null
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleChantPress = (mantra) => {
        setSelectedMantra(mantra);
        setModalVisible(true);
        setCountError('');
        setCustomCount('');
        setIsCustom(false);
        setSelectedCount(108);
    };

    const startChanting = () => {
        let finalCount = selectedCount;

        if (isCustom) {
            const num = parseInt(customCount);
            if (!num || num <= 0) {
                setCountError(isHindi ? 'कृपया मान्य संख्या दर्ज करें' : 'Please enter a valid number');
                return;
            }
            if (num > 300) {
                setCountError(t.modal.limitError);
                return;
            }
            finalCount = num;
        }

        setModalVisible(false);
        navigation.navigate('Chanting', {
            mantra: selectedMantra,
            targetCount: finalCount
        });
    };

    const handleListenPress = (mantra) => {
        setSelectedMantra(mantra);
        setListenModalVisible(true);
    };

    const startListening = () => {
        setListenModalVisible(false);
        navigation.navigate('MantraPlayer', {
            mantra: selectedMantra
        });
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {/* Left: Image */}
                    <Image
                        source={{ uri: item.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />

                    {/* Right: Info */}
                    <View style={styles.cardInfo}>
                        <Text style={styles.mantraTitle} numberOfLines={1}>
                            {isHindi ? item.sans.split(' ').slice(0, 3).join(' ') : item.title}
                        </Text>
                        <Text style={styles.sanskritText} numberOfLines={2}>{item.sans}</Text>
                        <Text style={styles.benefitText} numberOfLines={2}>
                            ✨ {isHindi ? item.benefit.hi : item.benefit.en}
                        </Text>
                    </View>
                </View>

                {/* Bottom: Dual Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.listenBtn]}
                        onPress={() => handleListenPress(item)}
                    >
                        <Ionicons name="musical-notes" size={18} color="#FFD700" />
                        <Text style={styles.listenBtnText}>{t.listenMantra}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.chantBtn]}
                        onPress={() => handleChantPress(item)}
                    >
                        <Ionicons name="repeat" size={18} color="#FFF" />
                        <Text style={styles.chantBtnText}>{t.startChanting}</Text>
                    </TouchableOpacity>
                </View>
            </View>
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

            {/* Preparation & Count Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="information-circle" size={24} color="#FFD700" />
                            <Text style={styles.modalTitle}>{t.modal.guidelines}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#AAA" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.guidelineBoxNew}>
                            <Text style={styles.guidelineTxtNew}>{t.modal.note}</Text>
                        </View>

                        <View style={styles.chantingHighlightBox}>
                            <Image
                                source={require('../assets/images/coins/gold_coins.png')}
                                style={styles.tipIcon}
                            />
                            <Text style={styles.motivationTxtSmall}>{t.modal.motivation}</Text>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.selectTitle}>{t.modal.selectCount}</Text>

                        <View style={styles.countGrid}>
                            {[11, 21, 108].map((count) => (
                                <TouchableOpacity
                                    key={count}
                                    style={[
                                        styles.countBox,
                                        !isCustom && selectedCount === count && styles.selectedBox
                                    ]}
                                    onPress={() => {
                                        setSelectedCount(count);
                                        setIsCustom(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.countBoxText,
                                        !isCustom && selectedCount === count && styles.selectedBoxText
                                    ]}>{count}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[styles.countBox, isCustom && styles.selectedBox]}
                                onPress={() => setIsCustom(true)}
                            >
                                <Text style={[
                                    styles.countBoxText,
                                    isCustom && styles.selectedBoxText
                                ]}>{isHindi ? 'कस्टम' : 'Custom'}</Text>
                            </TouchableOpacity>
                        </View>

                        {isCustom && (
                            <View>
                                <TextInput
                                    style={[styles.customInput, countError ? { borderColor: '#C62828' } : null]}
                                    placeholder={t.modal.customPlaceholder}
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    value={customCount}
                                    onChangeText={(val) => {
                                        setCustomCount(val);
                                        setCountError('');
                                    }}
                                    autoFocus
                                />
                                {countError ? <Text style={styles.limitErrorTxt}>{countError}</Text> : null}
                            </View>
                        )}

                        <TouchableOpacity style={styles.startFinalBtn} onPress={startChanting}>
                            <Text style={styles.startFinalBtnText}>{t.modal.startBtn}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Listening Preparation Modal */}
            <Modal
                transparent={true}
                visible={listenModalVisible}
                animationType="fade"
                onRequestClose={() => setListenModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.listenModalContent]}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="musical-notes" size={24} color="#FFD700" />
                            <Text style={styles.modalTitle}>{t.listenModal.title}</Text>
                            <TouchableOpacity onPress={() => setListenModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#BCAAA4" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.listeningHighlightBox}>
                            <Text style={styles.motivationTxt}>{t.listenModal.motivation}</Text>
                        </View>

                        <View style={styles.guidelineBoxNew}>
                            <Ionicons name="volume-medium" size={20} color="#FFCC80" style={{ marginBottom: 5 }} />
                            <Text style={styles.guidelineTxtNew}>{t.listenModal.guidelines}</Text>
                        </View>

                        <View style={styles.warningBox}>
                            <Ionicons name="alert-circle" size={16} color="#B0BEC5" style={{ marginRight: 5 }} />
                            <Text style={styles.warningTxt}>{t.listenModal.warning}</Text>
                        </View>

                        <TouchableOpacity style={styles.startFinalBtn} onPress={startListening}>
                            <Text style={styles.startFinalBtnText}>{t.listenModal.startBtn}</Text>
                            <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#1A120B'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'serif'
    },
    backButton: {
        padding: 5,
    },
    listContent: {
        padding: 15,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#2C1B10',
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3E2723',
        overflow: 'hidden',
        elevation: 5
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    cardImage: {
        width: 100,
        height: 120,
        borderRadius: 10,
        backgroundColor: '#1A120B'
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between'
    },
    mantraTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sanskritText: {
        color: '#FFF',
        fontSize: 14,
        marginVertical: 4,
        fontFamily: 'serif'
    },
    benefitText: {
        color: '#BCAAA4',
        fontSize: 12,
        fontStyle: 'italic',
    },
    actionSection: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#3E2723',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    listenBtn: {
        backgroundColor: '#1A120B',
    },
    chantBtn: {
        backgroundColor: '#BF360C',
    },
    listenBtnText: {
        color: '#FFD700',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    chantBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#BCAAA4',
        marginTop: 10
    },
    retryBtn: {
        marginTop: 15,
        padding: 10
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#1F1109',
        borderRadius: 20,
        width: '100%',
        padding: 24,
        borderWidth: 1,
        borderColor: '#3E2723',
        elevation: 10
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    modalTitle: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'serif',
        flex: 1,
        marginLeft: 10
    },
    modalDesc: {
        color: '#FFF',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
        fontStyle: 'italic',
        opacity: 0.9
    },
    divider: {
        height: 1,
        backgroundColor: '#3E2723',
        marginBottom: 20
    },
    selectTitle: {
        color: '#BCAAA4',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase'
    },
    countGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    countBox: {
        width: '23%',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#3E2723',
        backgroundColor: '#1A120B',
        alignItems: 'center',
        marginBottom: 10
    },
    selectedBox: {
        borderColor: '#FFD700',
        backgroundColor: '#3E2723'
    },
    countBoxText: {
        color: '#AAA',
        fontWeight: 'bold'
    },
    selectedBoxText: {
        color: '#FFD700'
    },
    customInput: {
        backgroundColor: '#1A120B',
        borderWidth: 1,
        borderColor: '#FFD700',
        borderRadius: 10,
        padding: 12,
        color: '#FFF',
        fontSize: 16,
        marginTop: 5,
        marginBottom: 15,
        textAlign: 'center'
    },
    startFinalBtn: {
        backgroundColor: '#E65100',
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    startFinalBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    limitErrorTxt: {
        color: '#FF5252',
        fontSize: 12,
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 10,
        fontWeight: 'bold'
    },
    chantingHighlightBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        width: '100%'
    },
    motivationTxtSmall: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
        fontFamily: 'serif'
    },
    tipIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    // Listen Modal Styles
    listenModalContent: {
        borderColor: '#FFD700',
        paddingBottom: 40
    },
    listeningHighlightBox: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        width: '100%'
    },
    motivationTxt: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'serif'
    },
    guidelineBoxNew: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center'
    },
    guidelineTxtNew: {
        color: '#BCAAA4',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center'
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(176, 190, 197, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 30,
        width: '100%'
    },
    warningTxt: {
        color: '#90A4AE',
        fontSize: 12,
        fontStyle: 'italic',
        flex: 1
    }
});

export default MantraSelectionScreen;

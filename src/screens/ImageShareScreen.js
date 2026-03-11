import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { useLoading } from '../contexts/LoadingContext';

const { width, height } = Dimensions.get('window');

const ImageShareScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { imageSource, imageId } = route.params;
    const viewRef = useRef();
    const [showWatermark, setShowWatermark] = useState(true);
    const [isQualityModalVisible, setQualityModalVisible] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState('Low Quality');
    const [isExporting, setIsExporting] = useState(false);
    const [isSupportModalVisible, setSupportModalVisible] = useState(false);
    const [adActionType, setAdActionType] = useState(null); // 'SHARE' or 'REMOVE_LOGO'
    const { showLoading, hideLoading } = useLoading();

    // Interstitial Ad Setup
    const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
    });

    useEffect(() => {
        if (isClosed) {
            handleAdComplete();
        }
    }, [isClosed]);

    useEffect(() => {
        if (isLoaded && adActionType) {
            show();
        }
    }, [isLoaded]);

    const handleAdComplete = async () => {
        const action = adActionType;
        setAdActionType(null); // Clear immediately to prevent double-triggers

        if (action === 'SHARE') {
            await executeShareAfterAd();
        } else if (action === 'REMOVE_LOGO') {
            setShowWatermark(false);
            hideLoading();
        }
    };

    const triggerAdGate = (type) => {
        setAdActionType(type);
        setQualityModalVisible(false);
        setSupportModalVisible(false);
        showLoading('Loading Ad...');
        load();
    };

    const updateShareCountApi = async (id) => {
        try {
            console.log(`[API Placeholder] Triggering share count update for image: ${id}`);
            // Logic for real API will go here:
            // await fetch('https://api.shrikrishnaapp.com/updateShare', { method: 'POST', body: JSON.stringify({ id }) });
        } catch (error) {
            console.warn('Share count update failed:', error);
        }
    };

    const handleSharePress = () => {
        setQualityModalVisible(true);
    };

    const confirmShare = async () => {
        triggerAdGate('SHARE');
    };

    const executeShareAfterAd = async () => {
        if (isExporting) return; // Guard against multiple triggers
        setIsExporting(true);
        try {
            // Trigger API update
            updateShareCountApi(imageId);

            // Capture the view
            const uri = await captureRef(viewRef, {
                format: 'jpg',
                quality: 1.0, // Default to Full HD
                result: 'tmpfile',
            });

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/jpeg',
                    dialogTitle: 'Share Divine Wallpaper',
                    UTI: 'public.jpeg',
                });
            } else {
                Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
            }
        } catch (error) {
            console.error('Sharing error:', error);
            Alert.alert('Error', 'Failed to generate image for sharing.');
        } finally {
            setIsExporting(false);
            hideLoading();
        }
    };

    const QualityOption = ({ label, icon, color }) => (
        <TouchableOpacity
            style={styles.qualityBtn}
            onPress={() => setSelectedQuality(label)}
        >
            <View style={styles.radioRow}>
                <Ionicons
                    name={selectedQuality === label ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selectedQuality === label ? "#9c6ce6" : "#aaa"}
                />
                <Ionicons name={icon} size={22} color={color} style={{ marginLeft: 15 }} />
                <Text style={[styles.qualityBtnText, selectedQuality === label && { color: '#fff' }]}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={32} color="#4dabf7" />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <View
                    style={styles.imageWrapper}
                    ref={viewRef}
                    collapsable={false}
                >
                    <Image source={{ uri: imageSource }} style={styles.mainImage} resizeMode="cover" />

                    {showWatermark && (
                        <View style={styles.watermarkBox}>
                            <Ionicons name="logo-google-playstore" size={20} color="#FFD700" style={{ marginRight: 8 }} />
                            <Text style={styles.watermarkText}>Sri Krishna Puja App</Text>
                            {!isExporting && (
                                <TouchableOpacity
                                    style={styles.removeWatermark}
                                    onPress={() => setSupportModalVisible(true)}
                                >
                                    <Ionicons name="close-circle" size={18} color="rgba(255,215,0,0.6)" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    onPress={handleSharePress}
                    activeOpacity={0.8}
                    disabled={isExporting}
                >
                    <LinearGradient
                        colors={['#4dabf7', '#9c6ce6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.shareButton, isExporting && { opacity: 0.7 }]}
                    >
                        <Text style={styles.shareButtonText}>
                            {isExporting ? 'Preparing...' : 'Share'}
                        </Text>
                        {!isExporting && (
                            <Ionicons name="share-social" size={24} color="#fff" style={styles.shareIcon} />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Quality Selection Modal (Now Ad-Gated) */}
            <Modal
                visible={isQualityModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setQualityModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
                        <View style={styles.modalHeaderIcon}>
                            <Ionicons name="share-social" size={40} color="#9c6ce6" />
                        </View>
                        <Text style={styles.modalTitle}>Watch an Ad to Share</Text>
                        <Text style={[styles.modalText, { marginBottom: 20 }]}>
                            Please watch a short video to support our temple and share this divine image with others.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalOkBtn}
                            onPress={confirmShare}
                        >
                            <LinearGradient
                                colors={['#4dabf7', '#9c6ce6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.okBtnGradient}
                            >
                                <Text style={styles.okBtnText}>Watch Ad & Share</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setQualityModalVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Logo Removal Support Modal */}
            <Modal
                visible={isSupportModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSupportModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: '#ffd700' }]}>
                        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
                        <View style={styles.modalHeaderIcon}>
                            <Ionicons name="heart" size={40} color="#ff4d4d" />
                        </View>
                        <Text style={[styles.modalTitle, { color: '#ffd700' }]}>Remove Watermark</Text>
                        <Text style={styles.modalText}>
                            Support our divine mission by watching a short ad to remove the watermark from this image.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalOkBtn}
                            onPress={() => triggerAdGate('REMOVE_LOGO')}
                        >
                            <LinearGradient
                                colors={['#ffd700', '#ff9933']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.okBtnGradient}
                            >
                                <Text style={[styles.okBtnText, { color: '#000' }]}>Watch Ad & Remove</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setSupportModalVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 15,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imageWrapper: {
        width: '100%',
        height: height * 0.65,
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    watermarkBox: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(156, 108, 230, 0.3)',
        borderStyle: 'dashed',
    },
    logoCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#9c6ce6',
        marginRight: 8,
    },
    logoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    watermarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
    },
    removeWatermark: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#000',
        borderRadius: 10,
    },
    footer: {
        paddingHorizontal: 20,
    },
    shareButton: {
        height: 55,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    shareIcon: {
        marginLeft: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    modalText: {
        color: '#eee',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    qualityBtn: {
        width: '100%',
        height: 60,
        backgroundColor: '#252525',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    qualityBtnText: {
        color: '#aaa',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalHeaderIcon: {
        marginBottom: 10,
    },
    modalOkBtn: {
        width: '100%',
        marginTop: 15,
        marginBottom: 5,
    },
    okBtnGradient: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    okBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalCloseBtn: {
        marginTop: 10,
        padding: 10,
    },
    modalCloseBtnText: {
        color: '#aaa',
        fontSize: 15,
    }
});

export default ImageShareScreen;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');

const ImageDownloadScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { imageSource, imageId } = route.params;
    const viewRef = useRef();

    const [showWatermark, setShowWatermark] = useState(true);
    const [isQualityModalVisible, setQualityModalVisible] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState('Low Quality');
    const [isDownloading, setIsDownloading] = useState(false);

    const updateDownloadCountApi = async (id) => {
        try {
            console.log(`[API Placeholder] Triggering download count update for image: ${id}`);
            // Logic for real API will go here:
            // await fetch('https://api.shrikrishnaapp.com/updateDownload', { method: 'POST', body: JSON.stringify({ id }) });
        } catch (error) {
            console.warn('Download count update failed:', error);
        }
    };

    const handleDownloadPress = () => {
        setQualityModalVisible(true);
    };

    const confirmDownload = async () => {
        setQualityModalVisible(false);
        setIsDownloading(true);

        try {
            // Request permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant gallery permissions to download the wallpaper.');
                setIsDownloading(false);
                return;
            }

            // Capture the view
            const uri = await captureRef(viewRef, {
                format: 'jpg',
                quality: selectedQuality === 'Full HD Quality' ? 1.0 : 0.6,
                result: 'tmpfile',
            });

            // Save to library
            await MediaLibrary.saveToLibraryAsync(uri);

            // Trigger API update
            updateDownloadCountApi(imageId);

            Alert.alert(
                'Sacred Download Success! 🙏',
                'The divine wallpaper has been saved to your gallery.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to save the image to your gallery.');
        } finally {
            setIsDownloading(false);
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
                    <Image source={imageSource} style={styles.mainImage} resizeMode="cover" />

                    {showWatermark && (
                        <View style={styles.watermarkBox}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>Ai</Text>
                            </View>
                            <Text style={styles.watermarkText}>AI God Status App</Text>
                            <TouchableOpacity
                                style={styles.removeWatermark}
                                onPress={() => setShowWatermark(false)}
                            >
                                <Ionicons name="close-circle" size={18} color="#9c6ce6" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    onPress={handleDownloadPress}
                    activeOpacity={0.8}
                    disabled={isDownloading}
                >
                    <LinearGradient
                        colors={['#4dabf7', '#9c6ce6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.shareButton, isDownloading && { opacity: 0.7 }]}
                    >
                        <Text style={styles.shareButtonText}>
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </Text>
                        {!isDownloading && (
                            <Ionicons name="download" size={24} color="#fff" style={styles.shareIcon} />
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Quality Selection Modal */}
            <Modal
                visible={isQualityModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setQualityModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Export Quality</Text>

                        <QualityOption label="Full HD Quality" icon="cloud-done-outline" color="#9c6ce6" />
                        <QualityOption label="Low Quality" icon="speedometer-outline" color="#aaa" />

                        <TouchableOpacity
                            style={styles.modalOkBtn}
                            onPress={confirmDownload}
                        >
                            <LinearGradient
                                colors={['#4dabf7', '#9c6ce6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.okBtnGradient}
                            >
                                <Text style={styles.okBtnText}>OK</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setQualityModalVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
        fontSize: 18,
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

export default ImageDownloadScreen;

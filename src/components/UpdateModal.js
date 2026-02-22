
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const UpdateModal = ({ visible, config, onIgnore }) => {
    if (!config) return null;

    const {
        latestVersion,
        minRequiredVersion,
        isForceUpdate,
        updateTitle,
        updateMessage,
        playStoreUrl,
        maintenanceMode,
        maintenanceMessage
    } = config;

    const handleUpdate = () => {
        if (playStoreUrl) {
            Linking.openURL(playStoreUrl).catch(err => console.error("Couldn't open URL", err));
        }
    };

    const isMaintenance = !!maintenanceMode;
    const isMandatory = !!isForceUpdate;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.container}
                >
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={isMaintenance ? ['#ff6b6b', '#ee5253'] : ['#D4AF37', '#8E6E17']}
                            style={styles.iconCircle}
                        >
                            <Ionicons
                                name={isMaintenance ? "construct" : "rocket"}
                                size={40}
                                color="#fff"
                            />
                        </LinearGradient>
                    </View>

                    <Text style={styles.title}>
                        {isMaintenance ? "Divine Upgrades" : updateTitle || "New Version Available"}
                    </Text>

                    <Text style={styles.message}>
                        {isMaintenance ? maintenanceMessage : updateMessage}
                    </Text>

                    {!isMaintenance && (
                        <View style={styles.versionRow}>
                            <View style={styles.versionBadge}>
                                <Text style={styles.versionText}>V{latestVersion}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        {!isMaintenance ? (
                            <>
                                <TouchableOpacity
                                    style={styles.updateButton}
                                    onPress={handleUpdate}
                                >
                                    <LinearGradient
                                        colors={['#D4AF37', '#8E6E17']}
                                        style={styles.buttonGradient}
                                    >
                                        <Text style={styles.updateButtonText}>UPDATE NOW</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {!isMandatory && (
                                    <TouchableOpacity
                                        style={styles.laterButton}
                                        onPress={onIgnore}
                                    >
                                        <Text style={styles.laterButtonText}>LATER</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <View style={styles.maintenanceBadge}>
                                <ActivityIndicator color="#ff6b6b" />
                                <Text style={styles.maintenanceText}>Please wait for a while...</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    container: {
        width: '100%',
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        elevation: 10,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconContainer: {
        marginTop: -60,
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#1a1a1a',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 15,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    versionRow: {
        marginBottom: 25,
    },
    versionBadge: {
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#D4AF37',
    },
    versionText: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    updateButton: {
        width: '100%',
        height: 55,
        borderRadius: 30,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    laterButton: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    laterButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: 'bold',
    },
    maintenanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 15,
        borderRadius: 15,
    },
    maintenanceText: {
        color: '#ff6b6b',
        fontSize: 14,
        fontWeight: '500',
    }
});

export default UpdateModal;

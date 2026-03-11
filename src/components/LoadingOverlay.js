import { BlurView } from 'expo-blur';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useLoading } from '../contexts/LoadingContext';

const LoadingOverlay = () => {
    const { isLoading, loadingMessage } = useLoading();

    if (!isLoading) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isLoading}
            onRequestClose={() => { }}
        >
            <View style={styles.overlay}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#ffd700" />
                    {loadingMessage ? (
                        <Text style={styles.message}>{loadingMessage}</Text>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
        padding: 35,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        minWidth: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
    message: {
        color: '#fff',
        marginTop: 20,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 22,
    },
});

export default LoadingOverlay;

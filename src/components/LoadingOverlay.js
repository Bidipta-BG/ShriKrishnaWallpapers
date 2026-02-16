import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLoading } from '../contexts/LoadingContext';

const LoadingOverlay = () => {
    const { isLoading, loadingMessage } = useLoading();

    if (!isLoading) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#9c6ce6" />
                <Text style={styles.message}>{loadingMessage}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    container: {
        backgroundColor: '#1a1a1a',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        minWidth: 200,
    },
    message: {
        color: '#fff',
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default LoadingOverlay;

import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutScreen = ({ navigation }) => {
    const handlePortfolio = () => {
        Linking.openURL('https://thevibecoder.com'); // Placeholder
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    {/* Placeholder for App Icon if available, else using generic icon */}
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="flower-outline" size={60} color="#FFD700" />
                    </View>
                    <Text style={styles.appName}>Sri Krishna Puja</Text>
                    <Text style={styles.appSubtitle}>Daily Puja & Aarti</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionText}>
                        Jai Sri Krishna! 🙏
                    </Text>
                    <Text style={styles.sectionText}>
                        This application is dedicated to all the devotees of Lord Krishna. Our mission is to provide a digital sanctuary where you can perform daily puja, listen to divine aartis, and immerse yourself in the bhakti of Sri Krishna and Nanha Kanhaiya.
                    </Text>
                    <Text style={styles.sectionText}>
                        We hope this app brings peace, joy, and spiritual connection to your daily life.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made with ❤️ by</Text>
                    <TouchableOpacity onPress={handlePortfolio}>
                        <Text style={styles.developerName}>Axom IT Lab</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    },
    backButton: {
        padding: 5,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    content: {
        padding: 30,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    appSubtitle: {
        fontSize: 16,
        color: '#9c6ce6',
        marginBottom: 10,
    },
    version: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        padding: 20,
        backgroundColor: '#111',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 40,
        width: '100%',
    },
    sectionText: {
        color: '#ddd',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 15,
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 5,
    },
    developerName: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AboutScreen;
